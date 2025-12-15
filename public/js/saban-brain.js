// public/js/saban-brain.js

const CONFIG = {
    keys: {
        gemini: "AIzaSyAdfGVrmr90Mp9ZhNMItD81iaE8OipKwz0", 
        googleSearch: "AIzaSyDLkShn6lBBew-PJJWtzvAe_14UF9Kv-QI",
        googleCX: "56qt2qgr7up25uvi5yjnmgqr3" 
    },
    oneSignalAppId: "07b81f2e-e812-424f-beca-36584b12ccf2"
};

// --- אתחול OneSignal ---
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

    // 1. שאילתה ל-Gemini (תוקן ל-gemini-1.5-flash)
    async ask(prompt, context = "אתה עוזר לוגיסטי חכם בחברת סבן.") {
        // 👇 התיקון נמצא כאן בשורה למטה
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

            if (!response.ok) {
                console.error("Gemini Error:", data);
                return "שגיאה בגישה למוח (API Error).";
            }

            return data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה.";

        } catch (error) {
            console.error("Network Error:", error);
            return "שגיאת תקשורת.";
        }
    },

    // 2. חיפוש מידע על מוצר (תוקן ל-gemini-1.5-flash)
    async searchProductInfo(productName) {
        // 👇 התיקון נמצא כאן בשורה למטה
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.keys.gemini}`;

        const prompt = `
        פעל כבוט טכני. אני צריך מידע על המוצר: "${productName}".
        החזר אך ורק אובייקט JSON תקין (בלי markdown, בלי backticks) בפורמט הזה:
        {
            "name": "שם מוצר מלא",
            "desc": "תיאור קצר",
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
            
            productData.img = `https://source.unsplash.com/400x400/?construction,${encodeURIComponent(productData.category || 'tool')}`;
            productData.price = Math.floor(Math.random() * 200) + 50; 
            productData.sku = "AI-" + Math.floor(Math.random() * 9999);
            
            return productData;

        } catch (e) {
            console.error("Search Logic Error:", e);
            return null;
        }
    }
};
