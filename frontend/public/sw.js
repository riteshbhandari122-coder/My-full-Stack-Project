const CACHE_NAME = 'shopmart-v2'; // bumped version to force refresh

// ✅ Only cache files that actually exist at these exact paths.
// Do NOT list /static/js/main.chunk.js or /static/js/bundle.js —
// CRA uses content-hashed filenames (e.g. main.abc123.chunk.js) which
// change on every build and will cause the SW install to fail silently,
// preventing the PWA install prompt from appearing.
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico',
];

// ✅ Install — cache only the safe static shell
self.addEventListener('install', (event) => {
  console.log('ShopMart SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('ShopMart SW: Caching static assets');
      // Use individual adds so one failure doesn't block the rest
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn('SW: failed to cache', url, err))
        )
      );
    })
  );
  self.skipWaiting();
});

// ✅ Activate — clean up old caches
self.addEventListener('activate', (event) => {
  console.log('ShopMart SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('ShopMart SW: Deleting old cache:', name);
            return caches.delete(name);
          })
      )
    )
  );
  self.clients.claim();
});

// ✅ Fetch — smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls — always fetch fresh from network
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ success: false, message: 'No internet connection' }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // Skip cross-origin except Cloudinary images
  if (
    url.origin !== self.location.origin &&
    !url.hostname.includes('res.cloudinary.com')
  ) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // ✅ Cache First — hashed static assets (/static/js/*, /static/css/*, images, fonts)
  // These are content-addressed (filename changes on rebuild), so cache forever
  if (
    url.pathname.startsWith('/static/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // ✅ Network First — HTML pages (index.html, routes)
  // Try network first, fall back to cache, then /index.html for SPA navigation
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        })
      )
  );
});

// ✅ Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'You have a new notification from ShopMart!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'View', icon: '/logo192.png' },
      { action: 'close', title: 'Dismiss' },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'ShopMart', options)
  );
});

// ✅ Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});