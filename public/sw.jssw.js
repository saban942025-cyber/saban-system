const CACHE_NAME = 'saban-suite-v1';
const ASSETS = [
  './harel-app.html',
  './driver-app.html',
  './ali-app.html',
  './oren-app.html',
  './tamir-app.html',
  './manifest-harel.json',
  './manifest-driver.json',
  './manifest-ali.json',
  './manifest-oren.json',
  './manifest-tamir.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
