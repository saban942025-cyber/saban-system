// public/js/saban-brain.js

const CONFIG = {
    keys: {
        // שימוש במודל החדש והיציב יותר
        gemini: "AIzaSyAdfGVrmr90Mp9ZhNMItD81iaE8OipKwz0", 
        googleSearch: "AIzaSyDLkShn6lBBew-PJJWtzvAe_14UF9Kv-QI",
        googleCX: "56qt2qgr7up25uvi5yjnmgqr3" 
    },
    oneSignalAppId: "07b81f2e-e812-424f-beca-36584b12ccf2"
};

// --- אתחול OneSignal (עם הגנה מקריסות) ---
window.OneSignalDeferred = window.OneSignalDeferred || [];
try {
    OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({
            appId: CONFIG.oneSignalAppId,
            safari_web_id: "web.onesignal.auto.88888888-8888-8888-8888-888888888888",
            notifyButton: { enable: true },
            allowLocalhostAsSecureOrigin: true, // מאפשר עבודה בלוקאל
        });
    });
} catch (e) {
    console.warn("OneSignal Warning: מערכת ההתראות לא נטענה (דורש HTTPS או Localhost).");
}

export const SabanBrain = {

    // 1. שאילתה ל-Gemini (מחשבון, צ'אט)
    async ask(prompt, context = "אתה עוזר לוגיסטי חכם בחברת סבן.") {
        // תיקון: שימוש במודל gemini-1.5-flash היציב יותר
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.keys.gemini}`;
        
        const payload = {
            contents: [{
                parts: [{
                    text: `הקשר: ${context}
                    שאלה: ${prompt}
                    הנחיות: ענה בעברית בלבד. היה קצר, מקצועי ותכליתי.`
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

            // --- מנגנון הגנה משגיאות ---
            if (!response.ok) {
                console.error("Gemini API Error:", data);
                return "שגיאה בתקשורת עם ה-AI. אנא נסה שנית.";
            }

            // חילוץ בטוח של התשובה (מונע את ה-TypeError)
            const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return answer || "לא התקבלה תשובה ברורה מהמוח.";

        } catch (error) {
            console.error("Network Error:", error);
            return "שגיאת רשת. בדוק חיבור לאינטרנט.";
        }
    },

    // 2. חיפוש מידע על מוצר (לקטלוג)
    async searchProductInfo(productName) {
        // שימוש במודל החדש גם כאן
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.keys.gemini}`;

        const prompt = `
        אני צריך מידע טכני על המוצר: "${productName}" לחנות חומרי בניין.
        החזר תשובה בפורמט JSON בלבד (ללא טקסט נוסף, ללא markdown) במבנה הבא:
        {
            "name": "שם מלא ומקצועי",
            "desc": "תיאור שיווקי קצר",
            "specs": {
                "weight": "משקל בק'ג (מספר בלבד)",
                "cover": "כושר כיסוי במ'ר (מספר בלבד)",
                "dry": "זמן ייבוש"
            },
            "category": "cement, glue, paint או tools"
        }`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) throw new Error("API Error");

            const data = await response.json();
            let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!text) return null;

            // ניקוי JSON למניעת שגיאות פרסור
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const productData = JSON.parse(text);
            
            // יצירת תמונה ו-SKU
            productData.img = `https://source.unsplash.com/400x400/?construction,${encodeURIComponent(productData.category || 'tool')}`;
            productData.price = Math.floor(Math.random() * 200) + 50; 
            productData.sku = "AI-" + Math.floor(Math.random() * 9999);
            
            return productData;

        } catch (e) {
            console.error("Parsing Error or API Fail", e);
            return null;
        }
    }
};
