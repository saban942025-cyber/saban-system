// public/services/saban-brain.js

// --- CONFIGURATION ---
const CONFIG = {
    keys: {
        gemini: "AIzaSyAdfGVrmr90Mp9ZhNMItD81iaE8OipKwz0",
        googleSearch: "AIzaSyDLkShn6lBBew-PJJWtzvAe_14UF9Kv-QI",
        // שים לב: לחיפוש גוגל צריך גם "Search Engine ID" (cx). 
        // אם אין לך, ה-AI יסתמך על הידע הפנימי שלו.
        googleCX: "YOUR_SEARCH_ENGINE_ID_HERE" 
    },
    oneSignalAppId: "07b81f2e-e812-424f-beca-36584b12ccf2"
};

// --- ONESIGNAL INIT ---
window.OneSignalDeferred = window.OneSignalDeferred || [];
OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
        appId: CONFIG.oneSignalAppId,
        safari_web_id: "web.onesignal.auto.88888888-8888-8888-8888-888888888888",
        notifyButton: { enable: true },
    });
});

// --- THE BRAIN CLASS ---
export const SabanBrain = {

    /**
     * התייעצות כללית או חישוב (לחמ"ל וללקוח)
     */
    async ask(prompt, context = "") {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${CONFIG.keys.gemini}`;
        
        const payload = {
            contents: [{
                parts: [{
                    text: `אתה יועץ מומחה לחומרי בניין בחברת "סבן לוגיסטיקה".
                    הקשר: ${context}
                    שאלה: ${prompt}
                    ענה בעברית, קצר ולעניין (מקסימום 3 משפטים). אם זה חישוב, תן תשובה מספרית מדויקת.`
                }]
            }]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Brain Error:", error);
            return "מצטער, ה-AI לא זמין כרגע. נסה שוב.";
        }
    },

    /**
     * חיפוש מוצרים ומידע מהרשת (לקטלוג)
     */
    async searchProductInfo(productName) {
        // שלב 1: ננסה להביא מידע מובנה מ-Gemini שמדמה חיפוש
        const prompt = `תן לי מידע טכני בפורמט JSON בלבד עבור המוצר: "${productName}".
        אני צריך: שם מלא, תיאור שיווקי קצר, משקל (ק"ג), כיסוי (מ"ר), זמן ייבוש.
        דוגמה לפורמט: {"name": "...", "desc": "...", "specs": {"weight": "25", "cover": "10", "dry": "24"}}`;

        try {
            const text = await this.ask(prompt, "בניית קטלוג מוצרים");
            // ניקוי ה-JSON מהתשובה
            const cleanJson = text.replace(/```json|```/g, '').trim();
            const productData = JSON.parse(cleanJson);
            
            // שלב 2: הוספת תמונה (סימולציה או חיפוש אמיתי אם יש CX)
            // אם היה לנו CX פעיל היינו משתמשים ב-Google Custom Search API כאן.
            // כרגע נשתמש בתמונת פלייסהולדר חכמה
            productData.img = `https://source.unsplash.com/400x400/?construction,${encodeURIComponent(productName)}`;
            productData.price = Math.floor(Math.random() * 200) + 50; // מחיר משוער לדוגמה
            
            return productData;
        } catch (e) {
            console.error("Search Error", e);
            return null;
        }
    },

    /**
     * שליחת התראה (OneSignal)
     */
    async sendNotification(title, message) {
        // בשימוש צד-לקוח אנחנו מוגבלים, בדרך כלל זה נעשה דרך השרת (Node.js)
        // אבל נשתמש ב-OneSignal SDK המקומי להצגת הודעה למשתמש עצמו
        console.log(`🔔 התראה נשלחה: ${title} - ${message}`);
        // כאן ניתן להוסיף קריאה ל-Cloud Function שתשלח לכולם
    }
};
