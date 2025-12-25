// public/js/notifications.js

export const SabanDesktop = {
    // 1. בקשת אישור (חייב לקרות בלחיצת כפתור)
    requestPermission: async () => {
        if (!("Notification" in window)) {
            console.log("❌ הדפדפן לא תומך בהתראות");
            return;
        }

        if (Notification.permission !== "granted") {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                new Notification("Saban System", { 
                    body: "🔔 מעולה! התראות הופעלו בהצלחה.",
                    icon: "https://cdn-icons-png.flaticon.com/512/3670/3670157.png"
                });
            }
        }
    },

    // 2. הצגת התראה (רק אם הדף לא בפוקוס)
    show: (title, body) => {
        if (Notification.permission === "granted" && document.hidden) {
            const notif = new Notification(title, {
                body: body,
                icon: "https://cdn-icons-png.flaticon.com/512/733/733585.png", // אייקון וואטסאפ ירוק
                tag: "saban-msg", // מונע הצפה של התראות זהות
                dir: "rtl"
            });

            // לחיצה על ההתראה פותחת את החלון
            notif.onclick = () => {
                window.focus();
                notif.close();
            };
            
            // סאונד של מערכת ההפעלה (אופציונלי, לפעמים קורה אוטומטית)
        } else {
            console.log("Skipping notification: Focused or no permission");
        }
    }
};
