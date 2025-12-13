// public/js/chatbot-engine.js
import { SabanPush } from './notifications.js';
import { SabanSounds } from './sounds.js';

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext; 
        
        this.rules = [
            // 1. מיקום ושטח
            {
                keywords: ["מיקום", "לשטח", "לאתר", "כתובת", "תביא ל", "איפה לפרוק"],
                answer: "כדי שהנהג יגיע בדיוק לנקודה, שלח לי מיקום נוכחי. 📍",
                buttons: [{ label: "📍 שלח מיקום GPS נוכחי", payload: "ACTION_SEND_LOC" }]
            },
            // 2. איש קשר / פרטים
            {
                keywords: ["איש קשר", "טלפון", "למי להתקשר", "פרטים", "מספר", "תעדכן"],
                answer: "אין בעיה. תעדכן כאן מי מקבל את הסחורה כדי שהנהג יידע למי לצלצל. 📞",
                buttons: [{ label: "📝 עדכון איש קשר לאספקה", payload: "ACTION_OPEN_CONTACT" }]
            },
            // 3. התייעצות מוצר
            {
                keywords: ["מתייעץ", "לגבי מוצר", "איך משתמשים", "מפרט", "מק\"ט", "כמה שוקל"],
                answer: "בשמחה! על איזה מוצר מדובר? 🧐\nאני יכול לשלוח מפרט טכני או הנחיות יישום.",
                buttons: [{ label: "הוראות יישום 🛠️", payload: "usage" }, { label: "דבר עם נציג 👨‍💻", payload: "human" }]
            },
            // 4. חירום
            {
                keywords: ["דחוף", "בהול", "עכשיו", "תקוע", "עצור", "שינוי", "טעות"],
                answer: "הבנתי שזה דחוף! 🚨\nהקפצתי התראה למנהל התפעול (רמי/אורן). איתך תוך דקות.",
                action: "urgent_alert"
            },
            // 5. היסטוריה
            {
                keywords: ["היסטוריה", "הזמנות שלי", "מה הזמנתי", "ארכיון"],
                answer: "בטח. הנה גישה ליומן ההזמנות שלך. 📜",
                buttons: [{ label: "פתח יומן הזמנות", payload: "ACTION_OPEN_HISTORY" }]
            },
            // 6. ברירת מחדל (הזמנה)
            {
                keywords: ["הזמנה", "להזמין", "תשלח", "מלט", "חול", "בלות", "טיט", "דבק", "גבס", "בלוקים"],
                answer: "קיבלתי את הרשימה! 📝\nמעביר להקלדה בקומקס. מספר הזמנה יישלח מיד.",
                action: "order_received"
            }
        ];
    }

    async ask(question) {
        if (!question) return null;
        const cleanQ = question.toLowerCase();

        for (const rule of this.rules) {
            const match = rule.keywords.some(kw => cleanQ.includes(kw));
            
            if (match) {
                // טיפול בסאונד
                if (rule.action === 'urgent_alert') {
                    if(SabanSounds) SabanSounds.playAlert();
                    await SabanPush.send('admin_rami', '🚨 דחוף מבוט', `${this.user.name}: ${question}`);
                } else {
                    if(SabanSounds) SabanSounds.playMessage();
                }

                return { 
                    text: rule.answer.replace("{name}", this.user.name || "חבר"), 
                    buttons: rule.buttons || [],
                    action: rule.action || null
                };
            }
        }

        return { text: "קיבלתי. מעביר לנציג. 👍", action: "fallback" };
    }
}
