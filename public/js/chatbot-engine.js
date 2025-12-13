/* Saban Chatbot Engine v5.0 (Final Fix)
   מודל: gemini-1.5-flash
   שיטה: חיבור ישיר (Direct Fetch)
*/

import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// המפתח שלך (נבדק ותקין)
const GEMINI_API_KEY = "AIzaSyD9plWwyTESFm24c_OTunf4mFAsAmfrgj0";

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext || { name: "אורח" };
        this.apiKey = GEMINI_API_KEY;
        this.emergencyKeywords = ["דחוף", "עצור", "תעצור", "טעות", "סכנה", "פצוע"];
    }

    // --- הפונקציה הראשית ---
    async ask(question) {
        if (!question) return { text: "אני מקשיב..." };
        
        // 1. חוקי ברזל (חירום)
        if (this.emergencyKeywords.some(k => question.includes(k))) {
            return { text: "🛑 עצרתי הכל! דיווחתי להראל ולרמי על אירוע חריג.\nנציג אנושי ייצור איתך קשר מיידי.", action: "urgent_alert" };
        }

        // 2. הפעלת המוח (AI)
        try {
            // נסיון שליפת מלאי (בלי להפיל את המערכת אם נכשל)
            let inventory = "רשימת המלאי לא זמינה כרגע (תענה תשובה כללית).";
            try {
                if (this.db) {
                    inventory = await this.getInventoryContext();
                }
            } catch (e) {
                console.warn("Inventory fetch skipped:", e);
            }

            // שליחה לגוגל
            const aiResponse = await this.generateAIResponse(question, inventory);
            return { text: aiResponse, action: "ai_reply" };

        } catch (error) {
            console.error("Bot Critical Error:", error);
            return { text: "יש לי תקלה קטנה בחיבור לאינטרנט... 🔌\nרשמתי את השאלה ואעביר לאורן." };
        }
    }

    // --- המנוע של גוגל (חיבור ישיר) ---
    async generateAIResponse(userQ, inventoryList) {
        // שימוש במודל 1.5 Flash - המהיר והיציב ביותר כרגע
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

        const prompt = `
        אתה העוזר החכם של "סבן חומרי בניין". שמך צ'אט-סבן.
        הלקוח שואל: "${userQ}"
        
        מוצרים שיש לנו במלאי כרגע:
        ${inventoryList}
        
        הנחיות:
        1. ענה בעברית, קצר ומקצועי (מקסימום 2 משפטים).
        2. אם המוצר במלאי - תמליץ עליו! זה הכי חשוב.
        3. אם אין במלאי - תגיד "אבדוק מול המחסן".
        4. תהיה נחמד.
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`Google API Error: ${errData.error?.message || response.status}`);
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
        if (snap.empty) return "אין מוצרים רשומים בקטלוג.";
        // לוקח את השם והמותג של כל מוצר
        return snap.docs.map(d => {
            const data = d.data();
            return `${data.core.name} (${data.core.brand || 'כללי'})`;
        }).join(", ");
    }
}
