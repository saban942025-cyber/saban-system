// public/js/notifications.js

const ONE_SIGNAL_APP_ID = "acc8a2bc-d54e-4261-b3d2-cc5c5f7b39d3";
const REST_API_KEY = "syyhlq4pzu7reurjs7lqgtb3g"; 

export const SabanPush = {
    
    // 1. אתחול מוגן (Safe Init)
    init: async (userRole, userId) => {
        try {
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            
            await window.OneSignalDeferred.push(async function(OneSignal) {
                try {
                    await OneSignal.init({
                        appId: ONE_SIGNAL_APP_ID,
                        safari_web_id: "web.onesignal.auto.5f4f9ed9-fb2e-4d6a-935d-81aa46fccce0",
                        allowLocalhostAsSecureOrigin: true,
                        notifyButton: { 
                            enable: true,
                            position: 'bottom-right',
                            offset: { bottom: '95px', right: '20px' },
                            colors: {
                                'circle.background': '#008069',
                                'circle.foreground': 'white',
                                'badge.background': '#ef4444',
                                'badge.foreground': 'white',
                                'dialog.button.background': '#008069'
                            }
                        }
                    });

                    if (userId) {
                        OneSignal.login(userId);
                        OneSignal.User.addTags({ role: userRole });
                        console.log(`🔔 SabanPush: Connected as ${userRole}`);
                    }
                } catch (innerError) {
                    console.warn("⚠️ התראות לא זמינות (בעיית דפדפן/IndexedDB):", innerError);
                }
            });
        } catch (e) {
            console.warn("⚠️ שגיאה כללית במערכת ההתראות:", e);
        }
    },

    // 2. שליחה (ללא שינוי)
    send: async (targetUid, title, message) => {
        try {
            // סימולציה אם השרת לא מוגדר, כדי לא לתקוע את הממשק
            console.log(`🚀 שליחת התראה ל-${targetUid}: ${title}`);
            /* const response = await fetch('/api/send-notification', { ... });
            */
        } catch (err) {
            console.error("שגיאה בשליחה:", err);
        }
    }
};
