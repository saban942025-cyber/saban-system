// ייבוא הסקריפט של OneSignal (חובה בשורה הראשונה)
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

const CACHE_NAME = 'saban-os-gold-v1';

// התקנה מיידית
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

// השתלטות על הדפדפן
self.addEventListener('activate', (e) => {
    e.waitUntil(self.clients.claim());
});

// ניהול רשת חכם (Network First)
// נותן עדיפות למידע עדכני, ומונע התנגשויות עם Firebase
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    
    // החרגות: דאטה בייס והתראות תמיד עוברים ישירות
    if (url.hostname.includes('firebase') || 
        url.hostname.includes('googleapis') || 
        url.hostname.includes('onesignal')) {
        return;
    }

    e.respondWith(
        fetch(e.request).catch(() => {
            // כאן אפשר להוסיף דף אופליין בעתיד
            return new Response("Offline Mode");
        })
    );
});
