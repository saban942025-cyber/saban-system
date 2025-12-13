/* Saban Chatbot Engine v2.2 (Fixed Model)
   תיקון: עדכון גרסת מודל ל-Gemini 1.5 Flash
*/

import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// המפתח שלך (השארתי אותו, הוא תקין)
const GEMINI_API_KEY = "AIzaSyD9plWwyTESFm24c_OTunf4mFAsAmfrgj0";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext || { name: "אורח" };
        
        // --- התיקון כאן: שינוי שם המודל לגרסה החדשה והמהירה ---
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
        
        this.emergencyKeywords = ["דחוף", "עצור", "תעצור", "טעות", "סכנה", "פצוע"];
    }

    async ask(question) {
        if (!question) return { text: "אני מקשיב..." };
        
        // 1. בדיקת חירום
        if (this.emergencyKeywords.some(k => question.includes(k))) {
            return { text: "🛑 עצרתי הכל! דיווחתי להראל ולרמי על אירוע חריג.\nנציג אנושי ייצור איתך קשר מיידי.", action: "urgent_alert" };
        }

        // 2. הפעלת בינה מלאכותית
        try {
            // נסיון שליפת מלאי (עם הגנה מקריסה)
            let inventory = "המידע על המלאי לא זמין כרגע, תענה באופן כללי.";
            try {
                if (this.db) {
                    inventory = await this.getInventoryContext();
                }
            } catch (dbError) {
                console.warn("Inventory skipped (Firebase issue):", dbError);
            }
            
            // שליחה לגוגל
            const aiResponse = await this.generateAIResponse(question, inventory);
            return { text: aiResponse, action: "ai_reply" };

        } catch (error) {
            console.error("AI Error:", error);
            return { text: "שגיאה בחיבור למוח (Gemini). 🔌\nאני מעביר את השאלה לאורן." };
        }
    }

    async generateAIResponse(userQ, inventoryList) {
        const prompt = `
        אתה העוזר החכם של "סבן חומרי בניין". שמך צ'אט-סבן.
        הלקוח שואל: "${userQ}"
        
        רשימת מוצרים שיש לנו במלאי:
        ${inventoryList}

        הנחיות:
        1. ענה בעברית, קצר ומקצועי.
        2. אם המוצר במלאי - תמליץ עליו בביטחון.
        3. אל תמציא מוצרים שלא ברשימה.
        4. תהיה נחמד ושירותי.
        `;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    async getInventoryContext() {
        const snap = await getDocs(collection(this.db, "products"));
        if (snap.empty) return "אין מוצרים רשומים בקטלוג כרגע.";
        return snap.docs.map(doc => {
            const d = doc.data();
            return `${d.core.name} (מותג: ${d.core.brand})`;
        }).join(", ");
    }
}
