const CACHE_NAME = 'saban-os-v1';

// התקנה
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

// הפעלה
self.addEventListener('activate', (e) => {
    return self.clients.claim();
});

// ניהול בקשות רשת
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // חוק ברזל: בקשות ל-Firebase, Google APIs או OneSignal - עוברות ישר לרשת (בלי Cache)
    if (url.hostname.includes('firebase') || 
        url.hostname.includes('googleapis') || 
        url.hostname.includes('onesignal') ||
        e.request.method === 'POST') {
        return; // תן לדפדפן לטפל בזה רגיל
    }

    // שאר הקבצים (HTML, CSS, JS) - נסה רשת, אם אין אז Cache
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
