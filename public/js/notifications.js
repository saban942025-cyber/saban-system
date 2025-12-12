// public/js/notifications.js

const ONE_SIGNAL_APP_ID = "acc8a2bc-d54e-4261-b3d2-cc5c5f7b39d3";
// שים לב: כאן צריך את ה-REST API KEY מלוח הבקרה של OneSignal (תחת Settings > Keys & IDs)
// ה-Key ID ששלחת נראה כמו מזהה פנימי, אבל לצורך השליחה צריך את המחרוזת הארוכה (REST API Key).
// אני שם כאן פלייסהולדר - תחליף אותו במפתח האמיתי שלך.
const REST_API_KEY = "OS_v1_..."; 

export const SabanPush = {
    
    // 1. אתחול המערכת (לשים בכל דף)
    init: async (userRole, userId) => {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        
        await OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
                appId: ONE_SIGNAL_APP_ID,
                safari_web_id: "web.onesignal.auto.5f4f9ed9-fb2e-4d6a-935d-81aa46fccce0",
                notifyButton: { enable: true }, // כפתור "פעמון" למטה
                allowLocalhostAsSecureOrigin: true,
            });

            // זיהוי המשתמש והצמדת תגיות
            if (userId) {
                OneSignal.login(userId); // חיבור ה-ID של המשתמש ל-OneSignal
                OneSignal.User.addTags({
                    role: userRole, // client, driver, admin
                    app_version: "v25.0"
                });
                console.log(`🔔 SabanPush: מחובר כ-${userRole} (${userId})`);
            }
        });
    },

    // 2. פונקציה לשליחת התראה (מיועדת לבוט ולמנהל)
    send: async (targetUid, title, message, data = {}) => {
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Basic ${REST_API_KEY}`
            },
            body: JSON.stringify({
                app_id: ONE_SIGNAL_APP_ID,
                include_external_user_ids: [targetUid], // שליחה לפי ה-UID שלנו
                contents: { en: message, he: message },
                headings: { en: title, he: title },
                data: data, // מידע נוסף (כמו מספר הזמנה)
                // כפתורים לפעולה מהירה
                buttons: [
                    {id: "open_app", text: "פתח אפליקציה", icon: "ic_menu_send"},
                    {id: "call_office", text: "חייג למשרד", icon: "ic_menu_call"}
                ]
            })
        };

        try {
            const response = await fetch('https://onesignal.com/api/v1/notifications', options);
            const json = await response.json();
            console.log("🚀 התראה נשלחה:", json);
            return json;
        } catch (err) {
            console.error("שגיאה בשליחת התראה:", err);
        }
    }
};
