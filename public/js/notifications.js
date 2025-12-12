// public/js/notifications.js

const ONE_SIGNAL_APP_ID = "acc8a2bc-d54e-4261-b3d2-cc5c5f7b39d3";

export const SabanPush = {
    
    // 1. אתחול (נשאר אותו דבר)
    init: async (userRole, userId) => {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        await OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
                appId: ONE_SIGNAL_APP_ID,
                safari_web_id: "web.onesignal.auto.5f4f9ed9-fb2e-4d6a-935d-81aa46fccce0",
                notifyButton: { enable: true },
                allowLocalhostAsSecureOrigin: true,
            });

            if (userId) {
                OneSignal.login(userId);
                OneSignal.User.addTags({ role: userRole });
                console.log(`🔔 SabanPush: מחובר כ-${userRole} (${userId})`);
            }
        });
    },

    // 2. שליחה - מעודכן! שולח לשרת שלנו במקום ל-OneSignal ישירות
    send: async (targetUid, title, message) => {
        try {
            // שולח בקשה לשרת המקומי (server.js)
            const response = await fetch('/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUid, title, message })
            });

            if (!response.ok) throw new Error("Server error");
            const json = await response.json();
            console.log("🚀 התראה נשלחה דרך השרת:", json);
            return json;

        } catch (err) {
            console.error("שגיאה בשליחת התראה:", err);
            alert("תקלה בשליחת ההתראה. וודא שהשרת רץ.");
        }
    }
};
