/* Saban Chatbot Engine - Unified Brain v9.0
   תכונות: Dual Core + Knowledge Injection (הזרקת ידע)
*/

import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const GEMINI_API_KEY = "AIzaSyD9plWwyTESFm24c_OTunf4mFAsAmfrgj0";

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext || { name: "אורח" };
        this.apiKey = GEMINI_API_KEY;
        this.knowledgeCache = ""; // זיכרון מטמון לחוקים
        this.lastCacheTime = 0;
    }

    // --- הפונקציה הראשית ---
    async ask(question) {
        if (!question) return { text: "..." };

        // 1. בניית הקשר חכם (מלאי + חוקים)
        let context = "טוען מידע...";
        try {
            context = await this.buildContext();
        } catch(e) { console.warn("Context build failed", e); }

        // 2. ניסיון שליחה כפול (Dual Try) - להגנה מקריסות גוגל
        try {
            // ניסיון א': Flash (מהיר)
            const response = await this.callGoogleModel(question, context, "gemini-1.5-flash");
            return { text: response, action: "ai_reply" };

        } catch (error1) {
            console.warn("⚠️ Flash model failed, switching to backup...", error1);
            try {
                // ניסיון ב': Pro (יציב)
                const responseBackup = await this.callGoogleModel(question, context, "gemini-pro");
                return { text: responseBackup, action: "ai_reply_backup" };
            } catch (error2) {
                console.error("❌ All models failed:", error2);
                return { text: "יש לי תקלת תקשורת רגעית עם גוגל. נסה שוב עוד דקה. 🔌" };
            }
        }
    }

    // --- בניית הקשר חכם (The Secret Sauce) ---
    async buildContext() {
        const now = Date.now();
        // ריענון מטמון כל 5 דקות או אם ריק
        if (this.knowledgeCache && (now - this.lastCacheTime < 300000)) {
            return this.knowledgeCache;
        }

        try {
            // א. שליפת מוצרים (מלאי)
            const productsSnap = await getDocs(collection(this.db, "products"));
            let inventory = "אין מוצרים כרגע.";
            if (!productsSnap.empty) {
                inventory = productsSnap.docs.map(d => {
                    const p = d.data().core;
                    return `${p.name} (${p.price}₪)`;
                }).join(", ");
            }

            // ב. שליפת חוקי ברזל (מהמאמן החדש)
            const faqSnap = await getDocs(collection(this.db, "faq"));
            let rules = "אין חוקים מיוחדים.";
            if (!faqSnap.empty) {
                rules = faqSnap.docs.map(d => {
                    const f = d.data();
                    return `שאלה: ${f.question} -> תשובה: ${f.answer}`;
                }).join("\n");
            }

            // ג. הרכבת הפרומפט המלא
            this.knowledgeCache = `
            [מידע מערכת פנימי - סודי]
            מלאי זמין בחנות: 
            ${inventory}
            
            חוקי ידע ותשובות מוכנות (השתמש במידע זה בעדיפות עליונה):
            ${rules}
            `;
            
            this.lastCacheTime = now;
            return this.knowledgeCache;

        } catch (e) {
            console.error("Context Error", e);
            return "מלאי זמין: כל המוצרים הסטנדרטיים.";
        }
    }

    // --- הפונקציה שפונה לגוגל ---
    async callGoogleModel(userQ, context, modelName) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;
        
        const prompt = `
        אתה העוזר החכם של "סבן חומרי בניין".
        שם הלקוח: ${this.user.name || "לקוח יקר"}
        
        ${context}
        
        הלקוח שואל: "${userQ}"
        
        הנחיות קריטיות:
        1. אם יש תשובה מתאימה ב"חוקי ידע", השתמש בה כלשונה.
        2. אם השאלה על מלאי, בדוק ברשימת המלאי המצורפת. אל תמציא מוצרים.
        3. ענה בעברית, קצר (עד 2-3 משפטים), מקצועי ואדיב.
        4. השתמש באימוג'י אחד או שניים לאווירה טובה.
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error(`Model ${modelName} Error: ${response.status}`);

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "לא הצלחתי לנסח תשובה.";
        }
    }
}
