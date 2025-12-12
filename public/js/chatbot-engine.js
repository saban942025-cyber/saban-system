// public/js/chatbot-engine.js
export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext; 
        this.knowledgeBase = [];
    }

    async loadTemplates() {
        try {
            const response = await fetch('templates.json');
            this.knowledgeBase = await response.json();
        } catch (e) { console.error("Error loading templates", e); }
    }

    async ask(question) {
        if (this.knowledgeBase.length === 0) await this.loadTemplates();

        // לוגיקת נהגים וסניפים
        if (question.includes("מנוף")) return { text: "הבנתי, מנוף. משימה ל-<b>חכמת</b>. 🏗️<br>תוודא שאין חוטי חשמל.", buttons: [{ label: "מאשר", action: "next_node", payload: "crane_ok" }] };
        if (question.includes("ידני")) return { text: "פריקה ידנית? זה <b>עלי</b>. 💪<br>יש תוספת תשלום על סבלות.", buttons: [{ label: "מאשר תוספת", action: "next_node", payload: "manual_ok" }] };
        
        // היתרים
        if (question.includes("הרצליה")) return { text: "🛑 בהרצליה חייבים היתר עירייה! יש לך?", buttons: [{ label: "יש לי", action: "permit_ok" }, { label: "אין לי", action: "permit_info" }] };

        // חיפוש רגיל
        let bestMatch = null, maxScore = 0;
        this.knowledgeBase.forEach(item => {
            let score = 0;
            item.keywords.forEach(kw => { if (question.includes(kw)) score++; });
            if (score > maxScore) { maxScore = score; bestMatch = item; }
        });

        if (bestMatch && maxScore > 0) return { text: bestMatch.answer.replace("{name}", this.user.name), buttons: bestMatch.buttons };
        return { text: "מצטער, לא הבנתי. דבר איתי על מכולות או חומרים.", action: "fallback" };
    }
}
// public/js/chatbot-engine.js
import { SabanPush } from './notifications.js'; // ייבוא

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext; 
        this.knowledgeBase = [];
    }

    // ... (טעינת תבניות) ...

    async ask(question) {
        // ... (לוגיקה קיימת) ...

        // דוגמה לשימוש בהתראה:
        if (question.includes("דחוף")) {
            // אם הלקוח כותב "דחוף", הבוט שולח התראה למנהל (רמי)
            SabanPush.send('admin_rami', 'לקוח במצוקה!', `הלקוח ${this.user.name} כתב דחוף בצ'אט.`);
            return { text: "העברתי התראה דחופה למנהל. מיד איתך." };
        }

        // ... (המשך לוגיקה) ...
        return { text: "לא הבנתי." };
    }
}
