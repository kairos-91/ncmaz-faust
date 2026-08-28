"use client";

import { useEffect, useState } from "react";
import { subscribeToPush } from "./actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaActions({
  slug,
  restaurantId,
  themeColor,
}: {
  slug: string;
  restaurantId: string;
  themeColor: string;
}) {
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
  const [subscribing, setSubscribing] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register(`/r/${slug}/sw.js`, { scope: `/r/${slug}` })
      .catch(() => {});

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if ("Notification" in window && Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((reg) =>
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setNotifState("subscribed");
        }),
      );
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [slug]);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  const enableNotifications = async () => {
    setNotifError(null);
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      setNotifError("Las notificaciones no están configuradas todavía.");
      return;
    }
    setSubscribing(true);
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
      const result = await subscribeToPush(restaurantId, {
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
      if (result.error) throw new Error(result.error);
      setNotifState("subscribed");
    } catch {
      setNotifError("No pudimos activar las notificaciones. Intenta de nuevo.");
    } finally {
      setSubscribing(false);
    }
  };

  const showInstallButton = Boolean(installEvent) && !installed;
  const showIOSHint = isIOS && !installed && !installEvent;

  if (!showInstallButton && !showIOSHint && notifState === "unsupported") {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showInstallButton && (
        <button
          type="button"
          onClick={install}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-white"
          style={{ backgroundColor: themeColor }}
        >
          📲 Instalar app
        </button>
      )}
      {showIOSHint && (
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          📲 En iPhone: toca compartir y luego &ldquo;Agregar a inicio&rdquo;.
        </p>
      )}
      {(notifState === "default" || notifState === "granted") && (
        <button
          type="button"
          disabled={subscribing}
          onClick={enableNotifications}
          className="rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-60"
          style={{ borderColor: themeColor, color: themeColor }}
        >
          {subscribing ? "Activando..." : "🔔 Recibir promociones"}
        </button>
      )}
      {notifState === "subscribed" && (
        <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
          🔔 Notificaciones activadas
        </span>
      )}
      {notifState === "denied" && (
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          Bloqueaste las notificaciones. Actívalas desde los ajustes del navegador.
        </p>
      )}
      {notifError && <p className="w-full text-xs text-red-600">{notifError}</p>}
    </div>
  );
}
