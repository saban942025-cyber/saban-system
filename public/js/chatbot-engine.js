// public/js/chatbot-engine.js
import { SabanPush } from './notifications.js';
import { SabanSounds } from './sounds.js';

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext; 
        
        // הגדרת החוקים בצורה בטוחה
        this.rules = [
            {
                keywords: ["הזמנה", "להזמין", "תשלח", "מלט", "חול", "בלות", "טיט", "דבק", "גבס", "בלוקים", "ברזל"],
                answer: "קיבלתי את הרשימה! 📝\nמעביר לטיפול מיידי של הצוות. מספר הזמנה יישלח בהקדם.",
                action: "order_received"
            },
            {
                keywords: ["מנוף", "קומה", "גג", "להרים"],
                answer: "אין בעיה, נספק עם מנוף (חכמת/אמיר). 🏗️\nרק תוודא שאין חוטי חשמל בגישה.",
                buttons: [{ label: "מאשר גישה תקינה ✅", payload: "crane_ok" }]
            },
            {
                keywords: ["דחוף", "בהול", "עכשיו", "תקוע", "עצור", "שינוי"],
                answer: "הבנתי שזה דחוף! 🚨\nהקפצתי התראה למנהל התפעול. איתך תוך דקות.",
                action: "urgent_alert"
            },
            {
                keywords: ["מתייעץ", "התייעצות", "לגבי מוצר", "איך משתמשים"],
                answer: "בשמחה! ראיתי שאתה מתעניין במוצר זה. 🧐\nזהו מוצר מעולה. האם תרצה לדעת על כושר כיסוי, זמן ייבוש, או הוראות יישום?",
                buttons: [{ label: "הוראות יישום 🛠️", payload: "usage" }, { label: "כמה צריך? (מחשבון)", payload: "calc" }]
            },
            {
                keywords: ["היי", "שלום", "בוקר טוב", "ערב טוב"],
                answer: "אהלן {name}! ברוך הבא לסבן. 👋\nאפשר להקליד כאן הזמנה, לשלוח מיקום או סתם לשאול שאלה.",
                buttons: [{ label: "הדבק הזמנה", payload: "paste_order" }]
            }
        ];
    }

    async ask(question) {
        if (!question) return null;
        console.log("Bot analyzing:", question);
        
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
