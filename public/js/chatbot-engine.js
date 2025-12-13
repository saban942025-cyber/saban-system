/* Saban Chatbot Engine v2.1 (Robust AI)
   תיקון: הפרדת תקלות מלאי מתקלות מוח
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
        this.model = genAI.getGenerativeModel({ model: "gemini-pro"});
        this.emergencyKeywords = ["דחוף", "עצור", "תעצור", "טעות", "סכנה", "פצוע"];
    }

    async ask(question) {
        if (!question) return { text: "אני מקשיב..." };
        
        // 1. בדיקת חירום (עובד מצוין)
        if (this.emergencyKeywords.some(k => question.includes(k))) {
            return { text: "🛑 עצרתי הכל! דיווחתי להראל ולרמי על אירוע חריג.\nנציג אנושי ייצור איתך קשר מיידי.", action: "urgent_alert" };
        }

        // 2. ניסיון להפעיל בינה מלאכותית
        try {
            // שלב א': ננסה למשוך מלאי, אבל בזהירות! אם נכשל - לא נורא.
            let inventory = "המידע על המלאי לא זמין כרגע, תענה באופן כללי.";
            try {
                inventory = await this.getInventoryContext();
            } catch (dbError) {
                console.warn("Firebase Error (Inventory skipped):", dbError);
                // ממשיכים הלאה גם אם אין חיבור למסד הנתונים
            }
            
            // שלב ב': שליחה לגוגל (חייב לעבוד)
            const aiResponse = await this.generateAIResponse(question, inventory);
            return { text: aiResponse, action: "ai_reply" };

        } catch (error) {
            console.error("CRITICAL AI ERROR:", error);
            // רק אם גוגל עצמו נכשל - נחזיר שגיאה
            return { text: "שגיאה בחיבור לשרתי גוגל (AI). 🔌\nבדוק את המפתח או את החיבור לאינטרנט." };
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
        2. אם המוצר במלאי - תמליץ עליו.
        3. אם המלאי לא ידוע - תן תשובה מקצועית כללית.
        4. תהיה נחמד.
        `;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    async getInventoryContext() {
        // מנסה למשוך נתונים. אם אין הרשאה - זה יזרוק שגיאה שנתפוס למעלה
        const snap = await getDocs(collection(this.db, "products"));
        if (snap.empty) return "אין מוצרים רשומים בקטלוג כרגע.";
        return snap.docs.map(doc => {
            const d = doc.data();
            return `${d.core.name} (מותג: ${d.core.brand})`;
        }).join(", ");
    }
}
