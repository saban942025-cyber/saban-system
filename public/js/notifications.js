// public/js/notifications.js
export const SabanPush = {
    init: async (role, uid) => {
        try {
            console.log(`Push Service Init for ${role}:${uid}`);
            // כאן תהיה האינטגרציה המלאה ל-OneSignal בעתיד
            // כרגע זה מונע שגיאות בקונסול
        } catch (e) {
            console.warn("Push notifications not supported/blocked");
        }
    },
    
    send: async (title, body) => {
        // סימולציה של שליחת התראה
        console.log(`🔔 PUSH: ${title} - ${body}`);
    }
};
