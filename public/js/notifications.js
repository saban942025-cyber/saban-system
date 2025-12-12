// public/js/notifications.js

const ONE_SIGNAL_APP_ID = "acc8a2bc-d54e-4261-b3d2-cc5c5f7b39d3";
const REST_API_KEY = "syyhlq4pzu7reurjs7lqgtb3g"; 

export const SabanPush = {
    
    // 1. אתחול המערכת
    init: async (userRole, userId) => {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        
        await OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
                appId: ONE_SIGNAL_APP_ID,
                safari_web_id: "web.onesignal.auto.5f4f9ed9-fb2e-4d6a-935d-81aa46fccce0",
                allowLocalhostAsSecureOrigin: true,
                
                // --- 🎨 עיצוב ומיקום הכפתור (התיקון כאן) ---
                notifyButton: { 
                    enable: true,
                    position: 'bottom-right', // או 'bottom-left' אם תרצה בצד השני
                    
                    // התיקון: הרמה לגובה 95 פיקסל (מעל הסרגל של ה-75px)
                    offset: { 
                        bottom: '95px', 
                        right: '20px' // רווח מהצד
                    },

                    // בונוס: צביעה בצבעי המותג (ירוק סבן)
                    colors: {
                        'circle.background': '#008069',
                        'circle.foreground': 'white',
                        'badge.background': '#ef4444',
                        'badge.foreground': 'white',
                        'badge.bordercolor': 'white',
                        'pulse.color': '#008069',
                        'dialog.button.background.hovering': '#006d59',
                        'dialog.button.background.active': '#006d59',
                        'dialog.button.background': '#008069',
                        'dialog.button.foreground': 'white'
                    },
                    
                    // טקסטים בעברית
                    text: {
                        'tip.state.unsubscribed': 'הירשם להתראות',
                        'tip.state.subscribed': 'אתה רשום להתראות',
                        'tip.state.blocked': 'ההתראות חסומות',
                        'message.action.subscribed': 'מעולה! נעדכן אותך.',
                        'message.action.resubscribed': 'נרשמת מחדש.',
                        'message.action.unsubscribed': 'לא נשלח יותר התראות.',
                        'dialog.main.title': 'קבל עדכונים מח.סבן',
                        'dialog.main.button.subscribe': 'אשר',
                        'dialog.main.button.unsubscribe': 'בטל',
                        'dialog.blocked.title': 'בטל חסימה',
                        'dialog.blocked.message': 'אנא עקוב אחר ההוראות לביטול החסימה.'
                    }
                }
            });

            if (userId) {
                OneSignal.login(userId);
                OneSignal.User.addTags({ role: userRole });
                console.log(`🔔 SabanPush: מחובר כ-${userRole} (${userId})`);
            }
        });
    },

    // 2. פונקציית שליחה (ללא שינוי)
    send: async (targetUid, title, message) => {
        try {
            const response = await fetch('/api/send-notification', { 
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
