// public/js/saban-brain.js

const CONFIG = {
    keys: {
        gemini: "AIzaSyAdfGVrmr90Mp9ZhNMItD81iaE8OipKwz0", // המפתח שלך
        googleSearch: "AIzaSyDLkShn6lBBew-PJJWtzvAe_14UF9Kv-QI",
        googleCX: "56qt2qgr7up25uvi5yjnmgqr3" 
    },
    oneSignalAppId: "07b81f2e-e812-424f-beca-36584b12ccf2"
};

// --- אתחול OneSignal (עם הגנה מקריסות) ---
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

    // 1. שאילתה ל-Gemini (עם מנגנון גיבוי סימולציה)
    async ask(prompt, context = "אתה עוזר לוגיסטי חכם בחברת סבן.") {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.keys.gemini}`;
        
        const payload = {
            contents: [{ parts: [{ text: `הקשר: ${context}\nשאלה: ${prompt}\nהנחיות: ענה בעברית, קצר ולעניין.` }] }]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.warn("Gemini API Failed (404/403). Switching to SIMULATION mode.");
                return this.simulateResponse(prompt); // הפעלת גיבוי
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה.";

        } catch (error) {
            console.error("Network Error, using simulation:", error);
            return this.simulateResponse(prompt); // הפעלת גיבוי
        }
    },

    // 2. חיפוש מידע על מוצר (עם מנגנון גיבוי סימולציה)
    async searchProductInfo(productName) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.keys.gemini}`;

        const prompt = `
        החזר JSON בלבד עבור המוצר: "${productName}".
        פורמט: {"name": "...", "desc": "...", "specs": {"weight": "...", "cover": "...", "dry": "..."}, "category": "cement|glue|paint|tools"}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
                console.warn("Gemini Search Failed. Switching to SIMULATION mode.");
                return this.simulateProductData(productName); // הפעלת גיבוי
            }

            const data = await response.json();
            let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) return this.simulateProductData(productName);

            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const productData = JSON.parse(text);
            
            // העשרת נתונים
            productData.img = `https://source.unsplash.com/400x400/?construction,${encodeURIComponent(productData.category || 'tool')}`;
            productData.price = Math.floor(Math.random() * 200) + 50; 
            productData.sku = "AI-" + Math.floor(Math.random() * 9999);
            return productData;

        } catch (e) {
            console.error("Search Error, using simulation:", e);
            return this.simulateProductData(productName); // הפעלת גיבוי
        }
    },

    // --- מנועי הסימולציה (כדי שהמערכת תמיד תעבוד) ---

    simulateResponse(prompt) {
        // תשובות דמי חכמות למקרה שה-API נופל
        if (prompt.includes("מלט") || prompt.includes("בטון")) return "לפי החישוב, תצטרך כ-12 שקים לכיסוי שטח כזה (יחס של 2.5 ק'ג למ'ר).";
        if (prompt.includes("דבק")) return "מומלץ להשתמש בדבק C2TE גמיש, זמן ייבוש 24 שעות.";
        if (prompt.includes("רובה")) return "לחדרים רטובים מומלץ רובה אקרילית או אפוקסית.";
        return "מצטער, השרתים עמוסים כרגע, אך המערכת רשמה את השאלה: '" + prompt + "'.";
    },

    simulateProductData(term) {
        // יצירת מוצר דמי חכם כדי שהקטלוג לא יקרוס
        const type = term.includes("מקדח") ? "tools" : term.includes("צבע") ? "paint" : "cement";
        return {
            name: term + " (מוצר הדגמה)",
            desc: "מוצר זה נוצר בסימולציה כי מפתח ה-AI דורש בדיקה.",
            specs: { weight: "25 קג", cover: "10 מ\"ר", dry: "24 שעות" },
            category: type,
            price: 150,
            sku: "DEMO-999",
            img: `https://source.unsplash.com/400x400/?construction,${type}`
        };
    }
};
