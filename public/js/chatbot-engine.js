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
            // ניסיון לטעון קובץ חיצוני
            const response = await fetch('templates.json');
            this.knowledgeBase = await response.json();
        } catch (e) {
            console.warn("Could not load templates.json, using internal fallback.");
            // גיבוי פנימי למקרה שהקובץ חסר
            this.knowledgeBase = [
                { keywords: ["היי", "שלום"], answer: "אהלן {name}! אני הבוט של סבן. איך אפשר לעזור?", buttons: [] }
            ];
        }
    }

    async ask(question) {
        // טעינה חד פעמית
        if (this.knowledgeBase.length === 0) await this.loadTemplates();
        
        const cleanQ = question.toLowerCase();

        // --- 1. זיהוי חירום והתראות (OneSignal) ---
        if (cleanQ.includes("דחוף") || cleanQ.includes("תקלה") || cleanQ.includes("הצילו")) {
            await SabanPush.send(
                'admin_rami', 
                '🚨 התראה מהבוט', 
                `הלקוח ${this.user.name} מדווח: "${question}"`
            );
            return { 
                text: "הבנתי שזה דחוף. 🚨<br>שלחתי התראה מיידית לרמי והצוות, נחזור אליך בהקדם האפשרי.", 
                action: "urgent_report"
            };
        }

        // --- 2. לוגיקת נהגים וסניפים ---
        if (cleanQ.includes("מנוף")) {
            return { 
                text: "מנוף? אין בעיה. משימה ל-<b>חכמת</b>. 🏗️<br>רק תוודא שאין חוטי חשמל מעל נקודת הפריקה.", 
                buttons: [{ label: "מאשר, יש גישה", action: "next_node", payload: "crane_ok" }] 
            };
        }
        
        if (cleanQ.includes("ידני") || cleanQ.includes("סבלות")) {
            return { 
                text: "פריקה ידנית? זה <b>עלי</b>. 💪<br>שים לב: יש תוספת תשלום על סבלות לפי קומה.", 
                buttons: [{ label: "מאשר תוספת", action: "next_node", payload: "manual_ok" }] 
            };
        }
        
        // --- 3. היתרים ורגולציה ---
        if (cleanQ.includes("הרצליה")) {
            return { 
                text: "🛑 עצור! בהרצליה חייבים היתר עירייה למכולה.<br>בלי היתר = קנס מיידי. יש לך אישור?", 
                buttons: [
                    { label: "כן, יש לי היתר", action: "permit_ok" }, 
                    { label: "לא, איך מוציאים?", action: "permit_info" }
                ] 
            };
        }

        // --- 4. התייעצות על מוצר (מהחנות) ---
        if (cleanQ.includes("מתייעץ על") || cleanQ.includes("התייעצות")) {
             return { 
                 text: "בשמחה! אני רואה את המוצר שאתה מתעניין בו. מה תרצה לדעת?",
                 buttons: [
                     { label: "איך מיישמים?", action: "product_app" },
                     { label: "כמה בשק/משטח?", action: "product_qty" },
                     { label: "מתאים לחוץ?", action: "product_outdoor" }
                 ]
             };
        }

        // --- 5. חיפוש חכם במאגר הידע (Templates) ---
        let bestMatch = null, maxScore = 0;
        
        this.knowledgeBase.forEach(item => {
            let score = 0;
            if(item.keywords && Array.isArray(item.keywords)) {
                item.keywords.forEach(kw => { if (cleanQ.includes(kw)) score++; });
            }
            if (score > maxScore) { maxScore = score; bestMatch = item; }
        });

        if (bestMatch && maxScore > 0) {
            // החלפת משתנים דינמיים בטקסט
            let ans = bestMatch.answer.replace("{name}", this.user.name || "לקוח יקר");
            return { text: ans, buttons: bestMatch.buttons || [] };
        }

        // --- 6. ברירת מחדל (Fallback) ---
        return { 
            text: "מצטער, לא הבנתי בדיוק. 😅<br>נסה לשאול על: מכולות, חומרי בניין, הובלות, או כתוב 'דחוף' לנציג.", 
            action: "fallback" 
        };
    }
}
