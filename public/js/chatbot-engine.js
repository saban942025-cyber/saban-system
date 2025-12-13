// public/js/chatbot-engine.js
import { SabanPush } from './notifications.js';
import { SabanSounds } from './sounds.js';

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext; 
        
        this.rules = [
            // 1. זיהוי התייעצות על מוצר (מגיע מכפתור "התייעץ")
            {
                keywords: ["מתייעץ", "לגבי מוצר", "איך משתמשים", "מפרט", "מק\"ט"],
                answer: "בשמחה! ראיתי שאתה מתעניין במוצר הזה. 🧐\nאני יכול לשלוח לך דף נתונים טכני (PDF), הוראות יישום, או לחשב כמויות.",
                buttons: [{ label: "הוראות יישום 🛠️", payload: "usage" }, { label: "דבר עם נציג אנושי 👨‍💻", payload: "human" }]
            },
            // 2. היסטוריה וארכיון
            {
                keywords: ["היסטוריה", "הזמנות שלי", "מה הזמנתי", "LOG", "ארכיון"],
                answer: "אין בעיה. אתה יכול ללחוץ על כפתור 'ההזמנות שלי' בתפריט למעלה 📜,\nאו שאשלף לך את ההזמנה האחרונה כאן בצ'אט.",
                action: "fetch_history"
            },
            // 3. הזמנה חדשה
            {
                keywords: ["הזמנה", "להזמין", "תשלח", "מלט", "חול", "בלות", "טיט", "דבק", "גבס", "בלוקים", "ברזל"],
                answer: "קיבלתי את הרשימה! 📝\nמעביר לטיפול מיידי של הצוות (רמי/יואב). מספר הזמנה יישלח ברגע שיוקלד לקומקס.",
                action: "order_received"
            },
            // 4. לוגיקה תפעולית (מנוף)
            {
                keywords: ["מנוף", "קומה", "גג", "להרים"],
                answer: "אין בעיה, נספק עם מנוף (חכמת/אמיר). 🏗️\nרק תוודא שאין חוטי חשמל בגישה.",
                buttons: [{ label: "מאשר גישה תקינה ✅", payload: "crane_ok" }]
            },
            // 5. חירום
            {
                keywords: ["דחוף", "בהול", "עכשיו", "תקוע", "עצור", "שינוי"],
                answer: "הבנתי שזה דחוף! 🚨\nהקפצתי התראה למנהל התפעול. איתך תוך דקות.",
                action: "urgent_alert"
            },
            // 6. ברכה
            {
                keywords: ["היי", "שלום", "בוקר טוב", "ערב טוב"],
                answer: "אהלן {name}! ברוך הבא לסבן. 👋\nאפשר להקליד כאן הזמנה, לשלוח מיקום או סתם לשאול שאלה.",
                buttons: [{ label: "הדבק הזמנה", payload: "paste_order" }]
            }
        ];
    }

    async ask(question) {
        if (!question) return null;
        const cleanQ = question.toLowerCase();

        for (const rule of this.rules) {
            const match = rule.keywords.some(kw => cleanQ.includes(kw));
            
            if (match) {
                // סאונד והתראות
                if (rule.action === 'urgent_alert') {
                    if(SabanSounds) SabanSounds.playAlert();
                    await SabanPush.send('admin_rami', '🚨 דחוף מבוט', `${this.user.name}: ${question}`);
                } else {
                    if(SabanSounds) SabanSounds.playMessage();
                }

                const finalText = rule.answer.replace("{name}", this.user.name || "חבר");
                
                return { 
                    text: finalText, 
                    buttons: rule.buttons || [],
                    action: rule.action || null
                };
            }
        }

        return { 
            text: "קיבלתי. ההודעה הועברה לנציג אנושי להמשך טיפול. 👨‍💻",
            action: "fallback"
        };
    }
}
