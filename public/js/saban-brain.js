// public/js/saban-brain.js

const CONFIG = {
    keys: {
        // המפתח שלך (ודא שהוא פעיל ב-Google AI Studio)
        gemini: "AIzaSyD9plWwyTESFm24c_OTunf4mFAsAmfrgj0", 
        googleSearch: "AIzaSyDLkShn6lBBew-PJJWtzvAe_14UF9Kv-QI",
        googleCX: "56qt2qgr7up25uvi5yjnmgqr3" 
    },
    oneSignalAppId: "07b81f2e-e812-424f-beca-36584b12ccf2"
};

// --- אתחול OneSignal (מוגן מקריסות) ---
window.OneSignalDeferred = window.OneSignalDeferred || [];
try {
    OneSignalDeferred.push(async function(OneSignal) {
        const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        if (isSecure) {
            await OneSignal.init({
                appId: CONFIG.oneSignalAppId,
                safari_web_id: "web.onesignal.auto.88888888-8888-8888-8888-888888888888",
                notifyButton: { enable: true },
                allowLocalhostAsSecureOrigin: true,
            });
        }
    });
} catch (e) {
    console.warn("OneSignal Init Skipped");
}

export const SabanBrain = {

    // 1. שאילתה ל-Gemini (שימוש במודל 1.5 Flash החדש)
    async ask(prompt, context = "אתה עוזר לוגיסטי חכם בחברת סבן.") {
        // שינוי קריטי: המודל החדש
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

            // אם יש שגיאה, נציג אותה במלואה
            if (!response.ok) {
                console.error("Gemini API Error Full:", JSON.stringify(data, null, 2));
                return "שגיאה בגישה ל-AI (404/400). בדוק את המפתח או המודל.";
            }

            const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return answer || "המוח לא החזיר תשובה ברורה.";

        } catch (error) {
            console.error("Network Error:", error);
            return "שגיאת תקשורת. בדוק חיבור לרשת.";
        }
    },

    // 2. חיפוש מידע על מוצר
    async searchProductInfo(productName) {
        // שימוש במודל החדש גם כאן
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.keys.gemini}`;

        const prompt = `
        פעל כבוט טכני. אני צריך מידע על המוצר: "${productName}".
        החזר אך ורק אובייקט JSON תקין (בלי markdown, בלי backticks, בלי מילים נוספות) בפורמט הזה:
        {
            "name": "שם מוצר מלא",
            "desc": "תיאור קצר (עד 15 מילים)",
            "specs": {
                "weight": "משקל בק'ג (מספר)",
                "cover": "כיסוי במ'ר (מספר)",
                "dry": "זמן ייבוש"
            },
            "category": "cement או glue או paint או tools"
        }`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
                console.error("Gemini Search Error:", await response.json());
                return null;
            }

            const data = await response.json();
            let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!text) return null;

            // ניקוי JSON
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            
            let productData;
            try {
                productData = JSON.parse(text);
            } catch (e) {
                console.error("JSON Parse Error:", text);
                return null;
            }
            
            // השלמת נתונים
            productData.img = `https://source.unsplash.com/400x400/?construction,${encodeURIComponent(productData.category || 'tool')}`;
            productData.price = Math.floor(Math.random() * 200) + 50; 
            productData.sku = "AI-" + Math.floor(Math.random() * 9999);
            
            return productData;

        } catch (e) {
            console.error("General Search Error:", e);
            return null;
        }
    }
};

