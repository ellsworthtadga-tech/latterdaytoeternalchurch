// Service Worker for 日本語道 — The Path of Japanese
// Place this file (sw.js) in the same directory as japanese-learning.html

const CACHE_NAME = 'nihongo-v1';
const URLS_TO_CACHE = [
  './japanese-learning.html'
];

// Install: cache the app shell
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
             .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) return response;
      return fetch(event.request).then(function(networkResponse) {
        // Cache successful GET responses
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          var clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      });
    }).catch(function() {
      // Offline fallback — return cached HTML
      return caches.match('./japanese-learning.html');
    })
  );
});
