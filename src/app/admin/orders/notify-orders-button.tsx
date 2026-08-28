"use client";

import { useEffect, useState } from "react";
import { urlBase64ToUint8Array } from "@/lib/push-client";
import { subscribeAdminToPush, unsubscribeAdminFromPush } from "../actions";

export function NotifyOrdersButton({
  restaurantId,
  t,
}: {
  restaurantId: string;
  t: {
    enable: string;
    enabling: string;
    enabled: string;
    denied: string;
    error: string;
  };
}) {
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

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin" }).catch(() => {});

    if ("Notification" in window && Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((reg) =>
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setNotifState("subscribed");
        }),
      );
    }
  }, []);

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
      const result = await subscribeAdminToPush(restaurantId, {
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
      if (result.error) throw new Error(result.error);
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
        await unsubscribeAdminFromPush(restaurantId, subscription.endpoint);
        await subscription.unsubscribe();
      }
      setNotifState("granted");
    } finally {
      setBusy(false);
    }
  };

  if (notifState === "unsupported") return null;

  if (notifState === "denied") {
    return <p className="text-xs text-neutral-500 dark:text-neutral-500">{t.denied}</p>;
  }

  if (notifState === "subscribed") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={disable}
        className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 disabled:opacity-60 dark:bg-green-900/20 dark:text-green-400"
      >
        {t.enabled}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={enable}
        className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300"
      >
        {busy ? t.enabling : t.enable}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
