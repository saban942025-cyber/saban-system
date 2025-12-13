/* Saban Chatbot Engine v2.3 (Stable)
   מודל: gemini-pro (היציב ביותר)
*/

import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// המפתח שלך
const GEMINI_API_KEY = "AIzaSyD9plWwyTESFm24c_OTunf4mFAsAmfrgj0";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext || { name: "אורח" };
        
        // --- תיקון: חזרה למודל היציב ---
        this.model = genAI.getGenerativeModel({ model: "gemini-pro"});
        
        this.emergencyKeywords = ["דחוף", "עצור", "תעצור", "טעות", "סכנה", "פצוע"];
    }

    async ask(question) {
        if (!question) return { text: "אני מקשיב..." };
        
        // 1. חירום
        if (this.emergencyKeywords.some(k => question.includes(k))) {
            return { text: "🛑 עצרתי הכל! דיווחתי להראל ולרמי.\nנציג ייצור קשר.", action: "urgent_alert" };
        }

        // 2. AI
        try {
            // נסיון שליפת מלאי (עם הגנה)
            let inventory = "מלאי בבדיקה, תענה כללית.";
            try {
                if (this.db) inventory = await this.getInventoryContext();
            } catch (e) { console.warn("Firebase skipped"); }
            
            // שליחה לגוגל
            const aiResponse = await this.generateAIResponse(question, inventory);
            return { text: aiResponse, action: "ai_reply" };

        } catch (error) {
            console.error("AI Error:", error);
            // אם גם זה נכשל, הודעת גיבוי
            return { text: "המוח מתעדכן... העברתי את השאלה למשרד. 🔌" };
        }
    }

    async generateAIResponse(userQ, inventoryList) {
        const prompt = `
        שמך צ'אט-סבן, מומחה חומרי בניין.
        שאלה: "${userQ}"
        מלאי זמין: ${inventoryList}
        
        הנחיות:
        1. ענה בעברית, קצר ומקצועי.
        2. אם המוצר במלאי - תמליץ עליו.
        3. תהיה נחמד.
        `;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    async getInventoryContext() {
        const snap = await getDocs(collection(this.db, "products"));
        if (snap.empty) return "אין מוצרים רשומים.";
        return snap.docs.map(d => `${d.core.name}`).join(", ");
    }
}
