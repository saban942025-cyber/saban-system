// public/js/chatbot-engine.js
import { SabanPush } from './notifications.js';

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
        } catch (e) {
            console.warn("Using fallback templates");
            this.knowledgeBase = [
                { keywords: ["היי", "שלום"], answer: "אהלן {name}! אני הבוט של סבן. איך אפשר לעזור?", buttons: [] }
            ];
        }
    }

    async ask(question) {
        if (this.knowledgeBase.length === 0) await this.loadTemplates();
        
        const cleanQ = question.toLowerCase();

        // 1. חירום והתראות
        if (cleanQ.includes("דחוף") || cleanQ.includes("תקלה")) {
            await SabanPush.send('admin_rami', '🚨 התראה מהבוט', `הלקוח ${this.user.name}: "${question}"`);
            return { text: "הבנתי, זה דחוף. שלחתי התראה לרמי והצוות. נחזור מיד.", action: "urgent" };
        }

        // 2. לוגיקה תפעולית (מנוף/ידני)
        if (cleanQ.includes("מנוף")) return { text: "מנוף? אין בעיה. משימה ל-<b>חכמת</b>. 🏗️<br>רק תוודא שאין חוטי חשמל.", buttons: [{ label: "מאשר", action: "next_node", payload: "crane_ok" }] };
        if (cleanQ.includes("ידני")) return { text: "פריקה ידנית? זה <b>עלי</b>. 💪<br>יש תוספת תשלום על סבלות.", buttons: [{ label: "מאשר תוספת", action: "next_node", payload: "manual_ok" }] };
        
        // 3. היתרים
        if (cleanQ.includes("הרצליה")) return { text: "🛑 בהרצליה חייבים היתר עירייה! יש לך?", buttons: [{ label: "יש לי", action: "permit_ok" }, { label: "אין לי", action: "permit_info" }] };

        // 4. חיפוש בתבניות
        let bestMatch = null, maxScore = 0;
        this.knowledgeBase.forEach(item => {
            let score = 0;
            if (item.keywords) item.keywords.forEach(kw => { if (cleanQ.includes(kw)) score++; });
            if (score > maxScore) { maxScore = score; bestMatch = item; }
        });

        if (bestMatch && maxScore > 0) {
            return { text: bestMatch.answer.replace("{name}", this.user.name || "לקוח"), buttons: bestMatch.buttons || [] };
        }

        return { text: "לא הבנתי בדיוק. נסה לשאול על מכולות, חומרים או לכתוב 'דחוף'.", action: "fallback" };
    }
}
