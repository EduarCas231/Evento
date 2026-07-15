self.addEventListener('push', e => {
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.titulo, {
      body: data.mensaje,
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(e.notification.data.url));
      if (existing) return existing.focus();
      return clients.openWindow(e.notification.data.url);
    })
  );
});
