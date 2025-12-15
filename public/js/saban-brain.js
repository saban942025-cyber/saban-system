// public/js/saban-brain.js

const CONFIG = {
    keys: {
        // המפתחות שלך
        gemini: "AIzaSyAdfGVrmr90Mp9ZhNMItD81iaE8OipKwz0", 
        googleSearch: "AIzaSyDLkShn6lBBew-PJJWtzvAe_14UF9Kv-QI",
        googleCX: "56qt2qgr7up25uvi5yjnmgqr3" 
    },
    oneSignalAppId: "07b81f2e-e812-424f-beca-36584b12ccf2"
};

// --- אתחול OneSignal (מוגן מקריסות) ---
window.OneSignalDeferred = window.OneSignalDeferred || [];
try {
    OneSignalDeferred.push(async function(OneSignal) {
        // בדיקה אם אנחנו בסביבה מאובטחת למניעת שגיאות SW
        const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        
        if (isSecure) {
            await OneSignal.init({
                appId: CONFIG.oneSignalAppId,
                safari_web_id: "web.onesignal.auto.88888888-8888-8888-8888-888888888888",
                notifyButton: { enable: true },
                allowLocalhostAsSecureOrigin: true,
            });
        } else {
            console.warn("OneSignal: התראות מושבתות (נדרש HTTPS או Localhost).");
        }
    });
} catch (e) {
    console.warn("OneSignal Error:", e);
}

export const SabanBrain = {

    // 1. שאילתה ל-Gemini (מודל יציב: gemini-pro)
    async ask(prompt, context = "אתה עוזר לוגיסטי חכם בחברת סבן.") {
        // תיקון קריטי: מעבר למודל gemini-pro היציב למניעת שגיאות 404
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${CONFIG.keys.gemini}`;
        
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

            // בדיקת שגיאות מה-API
            if (!response.ok) {
                console.error("Gemini API Error Detail:", data);
                return "שגיאה בגישה ל-AI. נסה שנית מאוחר יותר.";
            }

            // חילוץ תשובה
            const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return answer || "המוח לא החזיר תשובה ברורה.";

        } catch (error) {
            console.error("Network/Brain Error:", error);
            return "שגיאת תקשורת. בדוק את החיבור לרשת.";
        }
    },

    // 2. חיפוש מידע על מוצר
    async searchProductInfo(productName) {
        // שימוש באותו מודל יציב
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${CONFIG.keys.gemini}`;

        const prompt = `
        פעל כבוט טכני. אני צריך מידע על המוצר: "${productName}".
        החזר אך ורק אובייקט JSON תקין (בלי markdown, בלי backticks) בפורמט הזה:
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

            if (!response.ok) throw new Error("API Error");

            const data = await response.json();
            let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!text) return null;

            // ניקוי אגרסיבי של התשובה כדי להבטיח JSON תקין
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            
            let productData;
            try {
                productData = JSON.parse(text);
            } catch (jsonError) {
                console.error("Failed to parse JSON from AI:", text);
                return null;
            }
            
            // השלמת נתונים (תמונה ומחיר)
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
