/* Saban Chatbot Engine v3.0 (Direct API)
   חיבור ישיר ל-API למניעת שגיאות ספרייה
*/

import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// המפתח שלך
const GEMINI_API_KEY = "AIzaSyD2PehLHX2olQQavvHo2vjclOq7iSdiagI";

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
            return { text: "🛑 עצרתי הכל! דיווחתי להראל ולרמי.\nנציג ייצור קשר.", action: "urgent_alert" };
        }

        // 2. AI (חיבור ישיר)
        try {
            // נסיון שליפת מלאי
            let inventory = "מלאי בבדיקה, תענה כללית.";
            try {
                if (this.db) inventory = await this.getInventoryContext();
            } catch (e) { console.warn("Firebase skipped"); }
            
            // שליחה לגוגל
            const aiResponse = await this.generateAIResponse(question, inventory);
            return { text: aiResponse, action: "ai_reply" };

        } catch (error) {
            console.error("AI Error:", error);
            return { text: "שגיאה בתקשורת עם גוגל. 🔌\n(בדוק את ה-API Key)" };
        }
    }

    // פונקציה שפונה ישירות לכתובת ה-API (בלי ספריות)
    async generateAIResponse(userQ, inventoryList) {
        // הכתובת הישירה למודל הכי חדש ומהיר (Flash 1.5)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

        const prompt = `
        אתה העוזר החכם של "סבן חומרי בניין". שמך צ'אט-סבן.
        שאלה: "${userQ}"
        מלאי זמין: ${inventoryList}
        
        הנחיות:
        1. ענה בעברית, קצר ומקצועי (עד 2 משפטים).
        2. אם המוצר במלאי - תמליץ עליו.
        3. תהיה נחמד.
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Google API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // חילוץ התשובה מהמבנה של גוגל
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "לא הצלחתי לנסח תשובה.";
        }
    }

    async getInventoryContext() {
        const snap = await getDocs(collection(this.db, "products"));
        if (snap.empty) return "אין מוצרים רשומים.";
        return snap.docs.map(d => `${d.core.name}`).join(", ");
    }
}

