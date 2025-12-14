/* Saban Chatbot Engine v8.0 (Dual Core - Stability First)
   מנגנון: מנסה Flash -> אם נכשל עובר ל-Pro.
   תואם: Client App, Whatsapp Center, Admin Trainer.
*/

import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// המפתח שלך
const GEMINI_API_KEY = "AIzaSyD9plWwyTESFm24c_OTunf4mFAsAmfrgj0";

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext || { name: "אורח" };
        this.apiKey = GEMINI_API_KEY;
        // מילים שעוצרות את הבוט ומזעיקות אדם
        this.emergencyKeywords = ["דחוף", "עצור", "תעצור", "טעות", "סכנה", "פצוע", "הצילו"];
    }

    // --- הפונקציה הראשית שכולם קוראים לה ---
    async ask(question) {
        if (!question) return { text: "..." };

        // 1. בדיקת חירום (Rule Based)
        if (this.emergencyKeywords.some(k => question.includes(k))) {
            return { 
                text: "🛑 עצרתי הכל! דיווחתי להראל ולרמי על מקרה דחוף.", 
                action: "urgent_alert" 
            };
        }

        // 2. הכנת המוח (Context)
        let inventory = "מלאי זמין: כל המוצרים הסטנדרטיים.";
        try {
            // מנסה לשלוף מלאי, אם נכשל - לא תוקע את הבוט
            if (this.db) inventory = await this.getInventoryContext();
        } catch (e) { 
            console.warn("Inventory fetch skipped (Offline mode)", e); 
        }

        // 3. הפעלת המנוע הכפול (Dual Core AI)
        try {
            // נסיון ראשון: המודל המהיר (Flash)
            const response = await this.callGoogleModel(question, inventory, "gemini-1.5-flash");
            return { text: response, action: "ai_reply" };

        } catch (error1) {
            console.warn("⚠️ Flash model failed, switching to Backup (Pro)...", error1);
            
            try {
                // נסיון שני: המודל היציב (Pro) - גיבוי
                const responseBackup = await this.callGoogleModel(question, inventory, "gemini-pro");
                return { text: responseBackup, action: "ai_reply_backup" };
            } catch (error2) {
                console.error("❌ Critical AI Failure:", error2);
                return { text: "המערכת באתחול תקשורת... (נסה שוב עוד רגע) 🔌" };
            }
        }
    }

    // --- הפונקציה שפונה לגוגל (Generic Fetch) ---
    async callGoogleModel(userQ, inventory, modelName) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;
        
        const prompt = `
        אתה העוזר החכם של "סבן חומרי בניין".
        הלקוח (${this.user.name}) שואל: "${userQ}"
        
        מידע על המלאי שלנו:
        ${inventory}
        
        הנחיות:
        1. ענה בעברית, קצר (עד 2 משפטים) ומקצועי.
        2. המלץ רק על מוצרים שיש במלאי.
        3. אם משווים בין מוצרים - תן המלצה ברורה.
        4. תהיה אדיב ומכירתי.
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            // זורק שגיאה כדי להפעיל את הגיבוי ב-catch למעלה
            throw new Error(`Model ${modelName} Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "לא הצלחתי לנסח תשובה.";
        }
    }

    // --- שליפת מלאי חכמה ---
    async getInventoryContext() {
        const snap = await getDocs(collection(this.db, "products"));
        if (snap.empty) return "אין מידע מלאי כרגע.";
        
        // שולף שם, מחיר ומותג לכל מוצר כדי שהבוט ידע מה להציע
        return snap.docs.map(d => {
            const p = d.data().core;
            return `${p.name} (${p.brand || 'כללי'}) - ${p.price}₪`;
        }).join(", ");
    }
}
