/* Saban Chatbot Engine v7.0 (Auto-Discovery)
   פיצ'ר: זיהוי אוטומטי של המודל הזמין במפתח
*/

import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const GEMINI_API_KEY = "AIzaSyD9plWwyTESFm24c_OTunf4mFAsAmfrgj0";

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext || { name: "אורח" };
        this.apiKey = GEMINI_API_KEY;
        this.emergencyKeywords = ["דחוף", "עצור", "תעצור", "טעות", "סכנה", "פצוע"];
        this.cachedModelName = null; // נשמור את השם שנמצא כדי לא לחפש כל פעם
    }

    async ask(question) {
        if (!question) return { text: "..." };
        
        // 1. חירום
        if (this.emergencyKeywords.some(k => question.includes(k))) {
            return { text: "🛑 עצרתי הכל! דיווחתי להראל ולרמי.", action: "urgent_alert" };
        }

        // 2. AI
        try {
            // מלאי (דילוג שגיאות)
            let inventory = "מלאי בבדיקה.";
            try { if(this.db) inventory = await this.getInventoryContext(); } 
            catch (e) { console.warn("Firebase skipped"); }

            const aiResponse = await this.generateAIResponse(question, inventory);
            return { text: aiResponse, action: "ai_reply" };

        } catch (error) {
            console.error("Bot Error:", error);
            return { text: "תקלה במוח (בדוק F12 לפרטים). 🔌" };
        }
    }

    // --- איתור מודל אוטומטי ---
    async findActiveModel() {
        if (this.cachedModelName) return this.cachedModelName;

        try {
            // שואלים את גוגל: איזה מודלים יש לי?
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error?.message || "ListModels Failed");

            // מחפשים מודל שמכיל 'gemini' ותומך ב-generateContent
            const model = data.models.find(m => 
                m.name.includes("gemini") && 
                m.supportedGenerationMethods.includes("generateContent")
            );

            if (!model) throw new Error("לא נמצא מודל Gemini פעיל במפתח זה");
            
            console.log("✅ מודל נבחר אוטומטית:", model.name);
            this.cachedModelName = model.name; // שומרים לפעם הבאה (למשל: models/gemini-1.5-flash)
            return model.name;

        } catch (e) {
            console.error("Auto-Discovery Failed:", e);
            // ברירת מחדל אם הזיהוי נכשל
            return "models/gemini-pro"; 
        }
    }

    async generateAIResponse(userQ, inventoryList) {
        // שלב 1: מצא את המודל הנכון
        const modelName = await this.findActiveModel(); // מחזיר למשל 'models/gemini-1.5-flash'
        
        // שלב 2: שלח את הבקשה
        // שים לב: modelName כבר מכיל את ה-prefix 'models/' אז לא מוסיפים אותו ב-URL
        // אבל ה-API דורש לפעמים מבנה ספציפי. הנה התיקון:
        // אם modelName הוא "models/gemini-pro", ה-URL צריך להיות .../models/gemini-pro:generateContent
        
        const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${this.apiKey}`;

        const prompt = `
        שמך צ'אט-סבן. מומחה חומרי בניין.
        שאלה: "${userQ}"
        מלאי: ${inventoryList}
        הנחיות: ענה בעברית, קצר (2 משפטים), תמליץ אם יש במלאי. תהיה נחמד.
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`Google API Error (${modelName}): ${JSON.stringify(errData)}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "לא הצלחתי לנסח תשובה.";
        }
    }

    async getInventoryContext() {
        const snap = await getDocs(collection(this.db, "products"));
        if (snap.empty) return "אין מוצרים.";
        return snap.docs.map(d => d.data().core.name).join(", ");
    }
}
