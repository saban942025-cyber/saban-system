// public/js/notifications.js

const ONE_SIGNAL_APP_ID = "acc8a2bc-d54e-4261-b3d2-cc5c5f7b39d3";

export const SabanPush = {
    init: async (userRole, userId) => {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        await OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
                appId: ONE_SIGNAL_APP_ID,
                safari_web_id: "web.onesignal.auto.5f4f9ed9-fb2e-4d6a-935d-81aa46fccce0",
                notifyButton: { enable: true },
                allowLocalhostAsSecureOrigin: true,
                serviceWorkerPath: "OneSignalSDKWorker.js" // הפנייה מפורשת
            });

            if (userId) {
                OneSignal.login(userId);
                OneSignal.User.addTags({ role: userRole });
            }
        });
    },

    // הפונקציה המעודכנת - שולחת לשרת שלנו!
    send: async (targetUid, title, message) => {
        try {
            const response = await fetch('/api/send-notification', { // פנייה לשרת המקומי
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUid, title, message })
            });
            console.log("🚀 בקשת התראה נשלחה לשרת");
        } catch (err) {
            console.error("שגיאה:", err);
        }
    }
};
