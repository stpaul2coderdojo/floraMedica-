// FloraMedica Pro Offline Service Worker
const CACHE_NAME = 'floramedica-v4.5.0-300k';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/api/health',
  '/api/apk-info'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch((err) => {
        console.log('SW pre-cache non-fatal note:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = event.request.url;
  // NEVER hijack binary file downloads, APK/Windows downloads, or dynamic API routes
  if (
    url.includes('/api/download') ||
    url.includes('/download/') ||
    url.endsWith('.apk') ||
    url.endsWith('.exe') ||
    url.endsWith('.zip') ||
    url.includes('/marketing') ||
    url.includes('/api/identify-plant')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return caches.match('/');
      });
    })
  );
});
