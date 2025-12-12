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
            // טעינת תבניות מקובץ JSON חיצוני (אם קיים)
            const response = await fetch('templates.json');
            this.knowledgeBase = await response.json();
        } catch (e) { 
            console.warn("Could not load templates.json, using fallback.");
            // תבניות גיבוי למקרה שהקובץ חסר
            this.knowledgeBase = [
                { keywords: ["היי", "שלום"], answer: "אהלן! אני הבוט של סבן. איך אפשר לעזור?", buttons: [] }
            ];
        }
    }

    async ask(question) {
        if (this.knowledgeBase.length === 0) await this.loadTemplates();
        
        const cleanQ = question.toLowerCase();

        // 1. זיהוי חירום (שולח התראה לרמי)
        if (cleanQ.includes("דחוף") || cleanQ.includes("תקלה")) {
            await SabanPush.send(
                'admin_rami', 
                '🚨 התראה מהבוט', 
                `הלקוח ${this.user.name} דיווח על דחיפות: "${question}"`
            );
            return { 
                text: "הבנתי שזה דחוף. 🚨<br>שלחתי התראה מיידית לרמי והוא יחזור אליך בהקדם האפשרי.", 
                action: "urgent_report"
            };
        }

        // 2. לוגיקת נהגים וסניפים
        if (cleanQ.includes("מנוף")) return { text: "הבנתי, מנוף. משימה ל-<b>חכמת</b>. 🏗️<br>תוודא שאין חוטי חשמל.", buttons: [{ label: "מאשר", action: "next_node", payload: "crane_ok" }] };
        if (cleanQ.includes("ידני")) return { text: "פריקה ידנית? זה <b>עלי</b>. 💪<br>יש תוספת תשלום על סבלות.", buttons: [{ label: "מאשר תוספת", action: "next_node", payload: "manual_ok" }] };
        
        // 3. היתרים
        if (cleanQ.includes("הרצליה")) return { text: "🛑 בהרצליה חייבים היתר עירייה! יש לך?", buttons: [{ label: "יש לי", action: "permit_ok" }, { label: "אין לי", action: "permit_info" }] };

        // 4. התייעצות מוצר (מהחנות)
        if (cleanQ.includes("מתייעץ על") || cleanQ.includes("התייעצות")) {
             return { 
                 text: "בשמחה! אני רואה את המוצר. מה תרצה לדעת? (כמות במשטח, יישום, או משקל?)",
                 buttons: [
                     { label: "איך מיישמים?", action: "product_app" },
                     { label: "כמה במשטח?", action: "product_pallet" }
                 ]
             };
        }

        // 5. חיפוש רגיל במאגר הידע
        let bestMatch = null, maxScore = 0;
        this.knowledgeBase.forEach(item => {
            let score = 0;
            if(item.keywords) {
                item.keywords.forEach(kw => { if (cleanQ.includes(kw)) score++; });
            }
            if (score > maxScore) { maxScore = score; bestMatch = item; }
        });

        if (bestMatch && maxScore > 0) {
            let ans = bestMatch.answer.replace("{name}", this.user.name || "לקוח יקר");
            return { text: ans, buttons: bestMatch.buttons };
        }

        // 6. ברירת מחדל
        return { text: "מצטער, לא הבנתי בדיוק. נסה לשאול על מכולות, חומרים או כתוב 'דחוף' לנציג.", action: "fallback" };
    }
}
