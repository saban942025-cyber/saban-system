/* Saban Chatbot Engine - Dual Core v8.0
   פיצ'ר: ניסיון ראשי (Flash) + גיבוי אוטומטי (Pro) במקרה של שגיאה
*/

import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// המפתח שלך
const GEMINI_API_KEY = "AIzaSyD9plWwyTESFm24c_OTunf4mFAsAmfrgj0";

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext || { name: "אורח" };
        this.apiKey = GEMINI_API_KEY;
    }

    // --- הפונקציה הראשית ---
    async ask(question) {
        if (!question) return { text: "..." };

        // 1. שליפת הקשר (מלאי) - לא עוצרת את הבוט אם נכשלת
        let context = "מלאי זמין: כל המוצרים הסטנדרטיים.";
        try {
            if (this.db) context = await this.getInventoryContext();
        } catch (e) { console.warn("Context skip", e); }

        // 2. ניסיון שליחה כפול (Dual Try)
        try {
            // ניסיון א': המודל המהיר
            const response = await this.callGoogleModel(question, context, "gemini-1.5-flash");
            return { text: response, action: "ai_reply" };

        } catch (error1) {
            console.warn("⚠️ Flash model failed, switching to backup...", error1);
            
            try {
                // ניסיון ב': המודל היציב (גיבוי)
                const responseBackup = await this.callGoogleModel(question, context, "gemini-pro");
                return { text: responseBackup, action: "ai_reply_backup" };
            } catch (error2) {
                console.error("❌ All models failed:", error2);
                return { text: "יש לי תקלת תקשורת רגעית עם גוגל. נסה שוב עוד דקה. 🔌" };
            }
        }
    }

    // --- הפונקציה שפונה לגוגל ---
    async callGoogleModel(userQ, inventory, modelName) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;
        
        const prompt = `
        אתה העוזר החכם של "סבן חומרי בניין".
        הלקוח שואל: "${userQ}"
        מלאי נוכחי בחנות: ${inventory}
        
        הנחיות:
        1. ענה בעברית, קצר (עד 2 משפטים) ומקצועי.
        2. המלץ רק על מוצרים שיש במלאי.
        3. אם חסר מידע, תשאל את הלקוח.
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            // זורק שגיאה כדי להפעיל את הגיבוי
            throw new Error(`Model ${modelName} Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "לא הצלחתי לנסח תשובה.";
        }
    }

    // --- שליפת מלאי ---
    async getInventoryContext() {
        const snap = await getDocs(collection(this.db, "products"));
        if (snap.empty) return "אין מידע מלאי.";
        // שולף שמות מוצרים ומחירים
        return snap.docs.map(d => {
            const p = d.data().core;
            return `${p.name} (${p.price}₪)`;
        }).join(", ");
    }
}
