var cacheName = 'qrcodegen';
var filesToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './lib/qrcode.js/qrcode.js',
  './lib/qrcode.js/LICENSE',
  './images/128.png',
  './images/144.png',
  './images/152.png',
  './images/192.png',
  './images/256.png',
  './images/512.png',
  './favicon.ico',
  './sw.js'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
  self.skipWaiting();
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
