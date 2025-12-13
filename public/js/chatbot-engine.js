/* Saban Chatbot Engine v4.0 (Flash Model)
   מודל: gemini-1.5-flash (החדש והמהיר ביותר)
*/

import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// המפתח שלך (שעבר את הבדיקה!)
const GEMINI_API_KEY = "AIzaSyD9plWwyTESFm24c_OTunf4mFAsAmfrgj0";

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext || { name: "אורח" };
        this.apiKey = GEMINI_API_KEY;
        this.emergencyKeywords = ["דחוף", "עצור", "תעצור", "טעות", "סכנה", "פצוע"];
    }

    async ask(question) {
        if (!question) return { text: "אני מקשיב..." };
        
        // 1. חירום
        if (this.emergencyKeywords.some(k => question.includes(k))) {
            return { text: "🛑 עצרתי הכל! דיווחתי להראל ולרמי.\nנציג ייצור קשר מיידי.", action: "urgent_alert" };
        }

        // 2. AI
        try {
            // דילוג על שגיאות פיירבייס אם יש (כדי לא לתקוע את הבוט)
            let inventory = "מלאי בבדיקה, תענה באופן כללי.";
            try {
                if(this.db) inventory = await this.getInventoryContext();
            } catch (e) { console.warn("Firebase skipped"); }

            const aiResponse = await this.generateAIResponse(question, inventory);
            return { text: aiResponse, action: "ai_reply" };

        } catch (error) {
            console.error("Bot Error:", error);
            return { text: "שגיאה בחיבור למוח (נסה שוב). 🔌" };
        }
    }

    async generateAIResponse(userQ, inventoryList) {
        // --- התיקון הגדול: שימוש במודל 1.5-flash ---
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

        const prompt = `
        אתה העוזר החכם של "סבן חומרי בניין". שמך צ'אט-סבן.
        הלקוח שואל: "${userQ}"
        
        מוצרים שיש לנו במלאי כרגע:
        ${inventoryList}
        
        הנחיות:
        1. ענה בעברית, קצר (עד 2 משפטים) ומקצועי.
        2. אם המוצר במלאי - תמליץ עליו! זה הכי חשוב.
        3. אם אין במלאי - תגיד שתבדוק.
        4. תהיה נחמד.
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`Google Error: ${errData.error?.message || response.status}`);
        }

        const data = await response.json();
        
        // הגנה מפני תשובות ריקות
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "מצטער, לא הצלחתי לנסח תשובה כרגע.";
        }
    }

    async getInventoryContext() {
        const snap = await getDocs(collection(this.db, "products"));
        if (snap.empty) return "אין פריטים רשומים.";
        return snap.docs.map(d => `${d.core.name}`).join(", ");
    }
}
