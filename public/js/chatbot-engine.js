/* Saban Chatbot Engine v6.0 (Stable Pro)
   מודל: gemini-pro (המודל היציב ביותר למפתחות חינמיים)
*/

import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// המפתח שלך
const GEMINI_API_KEY = "AIzaSyD9plWwyTESFm24c_OTunf4mFAsAmfrgj0";

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext || { name: "אורח" };
        this.apiKey = GEMINI_API_KEY;
        this.emergencyKeywords = ["דחוף", "עצור", "תעצור", "טעות", "סכנה", "פצוע"];
    }

    async ask(question) {
        if (!question) return { text: "..." };
        
        // 1. חירום
        if (this.emergencyKeywords.some(k => question.includes(k))) {
            return { text: "🛑 עצרתי הכל! דיווחתי להראל ולרמי.\nנציג ייצור קשר.", action: "urgent_alert" };
        }

        // 2. AI
        try {
            // דילוג על שגיאות פיירבייס
            let inventory = "המלאי בבדיקה, תענה כללית.";
            try {
                if (this.db) inventory = await this.getInventoryContext();
            } catch (e) { console.warn("Firebase skipped"); }

            const aiResponse = await this.generateAIResponse(question, inventory);
            return { text: aiResponse, action: "ai_reply" };

        } catch (error) {
            console.error("Bot Error:", error);
            // הודעת שגיאה ברורה למשתמש
            return { text: "המוח מתעדכן כרגע... (תקלת תקשורת גוגל). 🔌" };
        }
    }

    async generateAIResponse(userQ, inventoryList) {
        // --- התיקון: חזרה למודל gemini-pro שעובד תמיד ---
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;

        const prompt = `
        שמך צ'אט-סבן, מומחה חומרי בניין.
        שאלה: "${userQ}"
        מלאי זמין: ${inventoryList}
        
        הנחיות:
        1. ענה בעברית, קצר (עד 2 משפטים).
        2. אם המוצר במלאי - תמליץ עליו.
        3. תהיה נחמד.
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
            // זורק שגיאה מדויקת לקונסול כדי שנראה מה קרה
            throw new Error(`Google Error ${response.status}: ${JSON.stringify(errData)}`);
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
