// Service worker mínimo compartido por el menú público y el panel admin:
// solo existe para instalar como app y recibir notificaciones push. No
// cachea nada del sitio.
export const PUSH_SERVICE_WORKER_SCRIPT = `
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (err) {
    payload = {};
  }
  const title = payload.title || "Levery";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon.png",
    badge: payload.icon || "/icon.png",
    vibrate: [300, 100, 300, 100, 300, 100, 300],
    requireInteraction: true,
    data: { url: payload.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    }),
  );
});
`;
