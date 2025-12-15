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
    }

    // --- הפונקציה הראשית ---
    async ask(question) {
        if (!question) return { text: "..." };

        // 1. שליפת הקשרים (מלאי + חוקים מהמאמן)
        // אנחנו בונים את "מוח העל" כאן
        let context = await this.buildContext();

        // 2. ניסיון שליחה כפול (Dual Try)
        try {
            // ניסיון א': Flash
            const response = await this.callGoogleModel(question, context, "gemini-1.5-flash");
            return { text: response, action: "ai_reply" };

        } catch (error1) {
            console.warn("⚠️ Flash model failed, switching to backup...", error1);
            try {
                // ניסיון ב': Pro
                const responseBackup = await this.callGoogleModel(question, context, "gemini-pro");
                return { text: responseBackup, action: "ai_reply_backup" };
            } catch (error2) {
                console.error("❌ All models failed:", error2);
                return { text: "תקלת תקשורת רגעית. נסה שוב." };
            }
        }
    }

    // --- בניית הקשר חכם (The Secret Sauce) ---
    async buildContext() {
        // אם כבר טענו את הידע, נשתמש בו (חוסך קריאות ל-DB)
        if (this.knowledgeCache) return this.knowledgeCache;

        try {
            // א. שליפת מוצרים (מלאי)
            const productsSnap = await getDocs(collection(this.db, "products"));
            let inventory = productsSnap.docs.map(d => {
                const p = d.data().core;
                return `${p.name} (${p.price}₪)`;
            }).join(", ");

            // ב. שליפת חוקי ברזל (מהמאמן החדש)
            const faqSnap = await getDocs(collection(this.db, "faq"));
            let rules = faqSnap.docs.map(d => {
                const f = d.data();
                return `שאלה: ${f.question} -> תשובה: ${f.answer}`;
            }).join("\n");

            // ג. הרכבת הפרומפט המלא
            this.knowledgeCache = `
            מלאי זמין בחנות: [${inventory}]
            
            חוקי ידע ותשובות מוכנות (השתמש במידע זה בעדיפות עליונה):
            ${rules}
            `;
            
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
        הלקוח שואל: "${userQ}"
        
        ${context}
        
        הנחיות:
        1. אם יש תשובה ב"חוקי ידע", השתמש בה.
        2. אם השאלה על מלאי, בדוק ברשימת המלאי.
        3. ענה קצר, בעברית, טון שירותי ומקצועי.
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error(`Model ${modelName} Error: ${response.status}`);

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }
}
