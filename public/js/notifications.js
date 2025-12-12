// public/js/notifications.js

// --- מפתחות OneSignal (הוזנו לפי בקשתך) ---
const ONE_SIGNAL_APP_ID = "acc8a2bc-d54e-4261-b3d2-cc5c5f7b39d3";
const REST_API_KEY = "syyhlq4pzu7reurjs7lqgtb3g"; 

export const SabanPush = {
    
    // 1. אתחול המערכת (לשים בכל דף: לקוח, נהג, מנהל)
    init: async (userRole, userId) => {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        
        await OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
                appId: ONE_SIGNAL_APP_ID,
                safari_web_id: "web.onesignal.auto.5f4f9ed9-fb2e-4d6a-935d-81aa46fccce0", // אופציונלי לאפל
                notifyButton: { enable: true }, // הפעמון הקטן בצד
                allowLocalhostAsSecureOrigin: true,
            });

            // זיהוי המשתמש והצמדת תגיות (Tags)
            if (userId) {
                // המזהה החיצוני הוא ה-UID של המשתמש שלנו
                OneSignal.login(userId); 
                
                // תיוג לפי תפקיד (כדי שנוכל לשלוח "לכל הנהגים")
                OneSignal.User.addTags({
                    role: userRole, // client / driver / admin
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
                // השימוש ב-Basic Auth עם ה-REST API Key מאפשר שליחה
                Authorization: `Basic ${REST_API_KEY}`
            },
            body: JSON.stringify({
                app_id: ONE_SIGNAL_APP_ID,
                include_aliases: { "external_id": [targetUid] }, // שליחה ספציפית ליוזר שלנו
                target_channel: "push",
                contents: { en: message, he: message },
                headings: { en: title, he: title },
                data: data, 
                // כפתורים לפעולה מהירה בהתראה
                buttons: [
                    {id: "open_app", text: "פתח את האפליקציה", icon: "ic_menu_send"},
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
            alert("שגיאה בשליחת ההתראה. בדוק בקונסול.");
        }
    }
};
