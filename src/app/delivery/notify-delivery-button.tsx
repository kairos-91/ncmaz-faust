"use client";

import { useEffect, useState } from "react";
import { urlBase64ToUint8Array } from "@/lib/push-client";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import {
  sendTestDeliveryPush,
  subscribeDeliveryToPush,
  unsubscribeDeliveryFromPush,
} from "./actions";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function NotifyDeliveryButton({ locale }: { locale: Locale }) {
  // Se resuelve del lado del cliente porque este diccionario incluye una
  // función (testSent) — pasarla como prop desde un Server Component
  // rompe con "Functions cannot be passed directly to Client Components".
  const t = getDictionary(locale).notifyDelivery;
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    );
  });
  const [isIOS] = useState(() => {
    if (typeof window === "undefined") return false;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !standalone;
  });
  const [notifState, setNotifState] = useState<
    "unsupported" | "default" | "granted" | "denied" | "subscribed"
  >(() => {
    if (typeof window === "undefined") return "default";
    if (!("Notification" in window) || !("PushManager" in window)) {
      return "unsupported";
    }
    if (Notification.permission === "denied") return "denied";
    if (Notification.permission === "granted") return "granted";
    return "default";
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testBusy, setTestBusy] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/delivery/sw.js", { scope: "/delivery" })
      .catch(() => {});

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if ("Notification" in window && Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((reg) =>
        reg.pushManager.getSubscription().then((sub) => {
          if (!sub) return;
          // Re-sincroniza con el servidor en cada carga (ver
          // NotifyOrdersButton para el porqué): si el guardado falló
          // alguna vez, el botón no debe quedar mostrando "activado" sin
          // que el servidor sepa nada de este dispositivo.
          const json = sub.toJSON();
          if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;
          subscribeDeliveryToPush({
            endpoint: json.endpoint,
            keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
          }).then((result) => {
            if (!result.error) setNotifState("subscribed");
          });
        }),
      );
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  const enable = async () => {
    setError(null);
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      setError(t.error);
      return;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNotifState(permission === "denied" ? "denied" : "default");
        return;
      }
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Tiempo de espera agotado")), 8000),
        ),
      ]);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("Suscripción inválida");
      }
      const result = await subscribeDeliveryToPush({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
      if (result.error) {
        await subscription.unsubscribe().catch(() => {});
        throw new Error(result.error);
      }
      setNotifState("subscribed");
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await unsubscribeDeliveryFromPush(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setNotifState("granted");
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    setTestBusy(true);
    setTestMessage(null);
    try {
      const result = await sendTestDeliveryPush();
      setTestMessage(
        "error" in result ? result.error : t.testSent(result.sent, result.total),
      );
    } catch {
      setTestMessage(t.testError);
    } finally {
      setTestBusy(false);
    }
  };

  const showInstallButton = Boolean(installEvent) && !installed;
  const showIOSHint = isIOS && !installed && !installEvent;

  if (notifState === "unsupported" && !showInstallButton && !showIOSHint) return null;

  if (notifState === "denied") {
    return <p className="text-xs text-neutral-500 dark:text-neutral-500">{t.denied}</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showInstallButton && (
        <button
          type="button"
          onClick={install}
          className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          {t.installApp}
        </button>
      )}
      {showIOSHint && (
        <p className="text-xs text-neutral-500 dark:text-neutral-500">{t.iosHint}</p>
      )}
      {notifState !== "unsupported" &&
        (notifState === "subscribed" ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={disable}
              className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 disabled:opacity-60 dark:bg-green-900/20 dark:text-green-400"
            >
              {t.enabled}
            </button>
            <button
              type="button"
              disabled={testBusy}
              onClick={sendTest}
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300"
            >
              {testBusy ? t.testSending : t.test}
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={enable}
            className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300"
          >
            {busy ? t.enabling : t.enable}
          </button>
        ))}
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
      {testMessage && (
        <p className="w-full text-xs text-neutral-500 dark:text-neutral-400">
          {testMessage}
        </p>
      )}
    </div>
  );
}
