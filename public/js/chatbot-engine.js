// public/js/chatbot-engine.js
import { SabanPush } from './notifications.js';
import { SabanSounds } from './sounds.js'; // ייבוא הסאונד

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext; 
        
        this.rules = [
            // --- טריגר חירום: שינוי הזמנה ---
            {
                keywords: ["להוסיף", "לשנות", "להגדיל", "טעות", "עצור"],
                answer: "🛑 עצרתי את ההזמנה! \nתייגתי את המחסנאי (אורן) ואת רמי.\nרשום כאן מה בדיוק להוסיף/לשנות?",
                action: "stop_order_alert"
            },
            // ... (שאר החוקים הרגילים נשארים כאן - הזמנה, מנוף וכו') ...
            {
                keywords: ["הזמנה", "להזמין", "תשלח", "מלט"],
                answer: "קיבלתי את הרשימה! 📝 מעביר לצוות.",
                action: "order_received"
            },
            {
                keywords: ["מתי", "צפי", "מגיע"],
                answer: "המשאית בסידור עבודה. 🚚\nאני בודק מיקום מול הנהג ושולח לך עדכון מיד.",
                action: "check_eta"
            }
        ];
    }

    async ask(question) {
        if (!question) return null;
        const cleanQ = question.toLowerCase();

        for (const rule of this.rules) {
            if (rule.keywords.some(kw => cleanQ.includes(kw))) {
                
                // טיפול באזעקות וסאונד
                if (rule.action === 'stop_order_alert') {
                    SabanSounds.playAlert(); // 🔊 צפצוף חזק!
                    // שליחת פוש למחסנאי ולמנהל
                    await SabanPush.send('admin_rami', '🛑 עצור ליקוט!', `הלקוח ${this.user.name} ביקש שינוי בהזמנה!`);
                    await SabanPush.send('warehouse_oren', '🛑 עצור ליקוט!', `הלקוח ${this.user.name} ביקש שינוי!`);
                } else {
                    SabanSounds.playMessage(); // 🎵 צליל רגיל
                }

                return { text: rule.answer, action: rule.action };
            }
        }
        return { text: "קיבלתי, בודק... 👨‍💻" };
    }
}
