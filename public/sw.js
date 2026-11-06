// GLOVA Platform Service Worker: Push Notifications & Offline Caching
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'GLOVA English - อย่าลืมรักษาไฟ Streak วันนี้!';
  const options = {
    body: data.body || 'เข้าฝึกบทเรียนสั้นๆ 3-5 นาทีเพื่อรักษาสถิติการเรียนของคุณ!',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-192x192.png',
    data: {
      url: data.url || '/dashboard',
      timestamp: Date.now(),
    },
    tag: data.tag || 'glova-streak-reminder',
    renotify: true,
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (windowClients.length > 0 && 'navigate' in windowClients[0] && 'focus' in windowClients[0]) {
        return windowClients[0].navigate(targetUrl).then((c) => c?.focus());
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
