/* Gota+Check push SW v2 */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "Gota+Check",
    body: "Tienes una nueva notificación",
    url: "/",
    tag: `gotacheck-${Date.now()}`,
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    /* use defaults */
  }

  const options = {
    body: payload.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag ?? `gotacheck-${Date.now()}`,
    renotify: true,
    data: { url: payload.url ?? "/pagos" },
  };

  event.waitUntil(
    (async () => {
      try {
        await self.registration.showNotification(payload.title, options);
      } catch {
        await self.registration.showNotification(payload.title, {
          body: payload.body,
          tag: options.tag,
          renotify: true,
          data: options.data,
        });
      }

      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clients) {
        client.postMessage({ type: "PUSH_RECEIVED", tag: options.tag });
      }
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});
