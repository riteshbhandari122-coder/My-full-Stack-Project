self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (event) => {
  // This allows the app to load from cache when offline
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});