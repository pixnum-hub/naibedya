// ═══════════════════════════════════════════════════════════════
//  নৈবেদ্য — Service Worker
//  Caches all app assets for full offline support
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'naibedya-v1';
const CACHE_VERSION = 1;

// All assets to cache on install
const PRECACHE_ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  './icons/icon-maskable-512x512.png',
  './icons/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700&family=Noto+Sans+Bengali:wght@300;400;600&display=swap',
];

// ── Install: pre-cache all assets ───────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing নৈবেদ্য v' + CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache local assets strictly, fonts with no-cors
      const localAssets = PRECACHE_ASSETS.filter(u => !u.startsWith('http'));
      const externalAssets = PRECACHE_ASSETS.filter(u => u.startsWith('http'));
      return Promise.all([
        cache.addAll(localAssets),
        ...externalAssets.map(url =>
          fetch(url, { mode: 'no-cors' })
            .then(res => cache.put(url, res))
            .catch(() => console.log('[SW] Could not cache:', url))
        )
      ]);
    }).then(() => {
      console.log('[SW] Pre-cache complete');
      return self.skipWaiting();
    })
  );
});

// ── Activate: clean up old caches ───────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating নৈবেদ্য v' + CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: Cache-first for local, Network-first for external ────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s)
  if (!url.protocol.startsWith('http')) return;

  // Strategy: Cache-first for same-origin, Network-first for external
  if (url.origin === location.origin) {
    // Cache-first (local files)
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        }).catch(() => {
          // Offline fallback for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
    );
  } else {
    // Network-first for external (fonts etc.)
    event.respondWith(
      fetch(event.request, { mode: 'no-cors' }).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match(event.request))
    );
  }
});

// ── Push Notifications ───────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'নৈবেদ্য 🪔';
  const options = {
    body: data.body || 'পূজার সময় হয়েছে। জয় মা!',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || './' },
    actions: [
      { action: 'open', title: 'অ্যাপ খুলুন' },
      { action: 'close', title: 'বন্ধ করুন' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click ───────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'close') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('./index.html');
    })
  );
});

// ── Background Sync (for future use) ────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'puja-reminder') {
    event.waitUntil(
      self.registration.showNotification('নৈবেদ্য 🪔', {
        body: 'পূজার সময় হয়েছে! জয় মা!',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-72x72.png',
      })
    );
  }
});
