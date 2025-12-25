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
// public/js/notifications.js

const SabanDesktop = {
    // בקשת אישור מהמשתמש (חובה לבצע בלחיצת כפתור)
    requestPermission: () => {
        if (!("Notification" in window)) {
            console.log("הדפדפן לא תומך בהתראות");
            return;
        }

        if (Notification.permission !== "granted") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Saban System", { body: "התראות הופעלו בהצלחה! 🔔" });
                }
            });
        }
    },

    // הצגת ההתראה בפועל
    show: (title, body, icon = null) => {
        if (Notification.permission === "granted") {
            // אם החלון לא בפוקוס - שלח התראה
            if (document.hidden) { 
                const notif = new Notification(title, {
                    body: body,
                    icon: icon || "https://cdn-icons-png.flaticon.com/512/733/733585.png", // אייקון ברירת מחדל
                    dir: "rtl"
                });
                
                // לחיצה על ההתראה תפתח את החלון
                notif.onclick = () => {
                    window.focus();
                    notif.close();
                };
            }
        }
    }
};

export { SabanDesktop };
