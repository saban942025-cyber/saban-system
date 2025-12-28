// 1. ייבוא הסקריפט של OneSignal (חובה בשורה הראשונה!)
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// 2. הגדרות PWA (התקנה וניהול גרסאות)
const CACHE_NAME = 'saban-os-v2';

self.addEventListener('install', (e) => {
    self.skipWaiting(); // דריסת גרסה ישנה מיד
});

self.addEventListener('activate', (e) => {
    e.waitUntil(self.clients.claim()); // השתלטות מיידית על הדף
});

// 3. ניהול בקשות רשת (Network First)
// מנסה רשת, אם אין - לא נתקע (אפשר להוסיף כאן Cache בעתיד אם תרצה אופליין מלא)
self.addEventListener('fetch', (e) => {
    // נותן ל-OneSignal ו-Firebase לעבור חופשי
    const url = new URL(e.request.url);
    if (url.hostname.includes('onesignal') || url.hostname.includes('firebase')) {
        return;
    }
    
    e.respondWith(
        fetch(e.request).catch(() => {
            // כאן אפשר להחזיר דף אופליין אם רוצים, כרגע נחזיר שגיאה שקטה
            return new Response("Offline"); 
        })
    );
});
