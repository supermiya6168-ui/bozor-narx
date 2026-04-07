const CACHE_NAME = 'bozor-narx-v1';
const BASE = '/bozor-narx';

const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
];

// O'rnatish — asosiy fayllarni keshlash
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Faollashtirish — eski keshni tozalash
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — avval keshdan, keyin internetdan
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // Yangi javobni keshga saqlash
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copy);
          });
        }
        return response;
      });
    }).catch(() => {
      // Internet yo'q bo'lsa — keshdan ochish
      return caches.match(BASE + '/');
    })
  );
});
