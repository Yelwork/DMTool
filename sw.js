// Self-destructing service worker:
// replaces any old caching SW, clears caches, then unregisters itself.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
      if (client.url && 'navigate' in client) {
        client.navigate(client.url);
      }
    }
  })());
});
