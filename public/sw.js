// Service Worker מינימלי להתקנת PWA
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // מעביר את כל הבקשות לרשת (כדי שתמיד תקבל גרסה מעודכנת ולא Cache ישן)
  e.respondWith(fetch(e.request));
});
