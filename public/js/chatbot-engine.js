/* Saban Chatbot Engine v2.0 (AI Powered)
   מופעל על ידי Google Gemini API
*/

import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- המפתח שלך (מוטמע) ---
const GEMINI_API_KEY = "AIzaSyD9plWwyTESFm24c_OTunf4mFAsAmfrgj0";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext || { name: "אורח" };
        
        // הגדרת המודל (המוח)
        this.model = genAI.getGenerativeModel({ model: "gemini-pro"});
        
        // חוקי ברזל (עוקפים את ה-AI)
        this.emergencyKeywords = ["דחוף", "עצור", "תעצור", "טעות", "סכנה", "פצוע"];
    }

    // --- הפונקציה הראשית ---
    async ask(question) {
        if (!question) return { text: "אני כאן, מקשיב... 👂" };
        
        // 1. בדיקת חירום (בטיחות קודמת לכל)
        if (this.emergencyKeywords.some(k => question.includes(k))) {
            return { 
                text: "🛑 עצרתי הכל! דיווחתי להראל ולרמי על אירוע חריג.\nנציג אנושי ייצור איתך קשר מיידי.", 
                action: "urgent_alert" 
            };
        }

        // 2. הפעלת הבינה המלאכותית
        try {
            // שלב א': שליפת המלאי העדכני מה-Firebase
            // הבוט "מציץ" במחסן לפני שהוא עונה
            const inventory = await this.getInventoryContext();
            
            // שלב ב': שליחה לגוגל
            const aiResponse = await this.generateAIResponse(question, inventory);
            
            return { 
                text: aiResponse, 
                action: "ai_reply" 
            };

        } catch (error) {
            console.error("AI Brain Freeze:", error);
            // אם ה-AI נכשל (אין אינטרנט וכו'), תשובת גיבוי:
            return { text: "המוח שלי מתעדכן כרגע... 🔌\nאבל רשמתי את השאלה ואעביר לאורן בחמ\"ל." };
        }
    }

    // --- עזרים טכניים ---

    // פונקציה שבונה את "האישיות" ושולחת לגוגל
    async generateAIResponse(userQ, inventoryList) {
        const prompt = `
        התנהג כמו מומחה מכירות ושירות של "סבן חומרי בניין".
        שמך הוא צ'אט-סבן.
        הלקוח (${this.user.name}) שואל: "${userQ}"
        
        הנה רשימת המוצרים שיש לנו כרגע במלאי (מהמסד נתונים):
        ${inventoryList}

        הנחיות לתשובה:
        1. תענה בעברית, קצר ולעניין (מקסימום 3 משפטים).
        2. תהיה אדיב ומקצועי.
        3. אם הלקוח מחפש מוצר שמופיע ברשימה למעלה - תמליץ לו עליו ותגיד "יש לנו במלאי!".
        4. אם המוצר לא ברשימה - תגיד "אבדוק מול המחסן אם נשאר".
        5. אם הוא שואל שאלה מקצועית (כמו "כמה זמן ייבוש"), תנסה לענות מידע כללי אם אתה יודע.
        6. הוסף אימוג'י אחד או שניים לאווירה טובה.

        תשובה:
        `;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    // שליפת שמות המוצרים מהדאטה-בייס לתוך מחרוזת אחת
    async getInventoryContext() {
        try {
            const snap = await getDocs(collection(this.db, "products"));
            if (snap.empty) return "המלאי כרגע בבדיקה.";
            
            // לוקח את כל שמות המוצרים והמותגים ומחבר לרשימה
            return snap.docs.map(doc => {
                const data = doc.data();
                return `${data.core.name} (${data.core.brand})`;
            }).join(", ");
        } catch (e) {
            return "לא הצלחתי לקרוא את המלאי.";
        }
    }
}
