// public/js/saban-brain.js

const CONFIG = {
    keys: {
        gemini: "AIzaSyAdfGVrmr90Mp9ZhNMItD81iaE8OipKwz0", // וודא שהמפתח הזה פעיל ב-Google AI Studio
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
    console.warn("OneSignal Warning: Skipped");
}

export const SabanBrain = {

    // פונקציית עזר לביצוע בקשה עם ניסיון כפול (מודל חדש -> מודל ישן -> סימולציה)
    async fetchGemini(payload) {
        const models = ['gemini-1.5-flash', 'gemini-pro'];
        
        for (const model of models) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${CONFIG.keys.gemini}`;
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.candidates?.[0]?.content?.parts?.[0]?.text;
                } else {
                    console.warn(`Model ${model} failed:`, response.status);
                }
            } catch (e) {
                console.warn(`Network error on ${model}`);
            }
        }
        return null; // אם שניהם נכשלו
    },

    // 1. שאילתה כללית (צ'אט/מחשבון)
    async ask(prompt, context = "אתה עוזר לוגיסטי.") {
        const payload = {
            contents: [{ parts: [{ text: `הקשר: ${context}\nשאלה: ${prompt}\nהנחיות: ענה בעברית, קצר ולעניין.` }] }]
        };

        const result = await this.fetchGemini(payload);
        
        if (result) return result;

        console.error("All Gemini models failed. Using SIMULATION.");
        return this.simulateResponse(prompt);
    },

    // 2. חיפוש מוצר
    async searchProductInfo(productName) {
        const prompt = `
        החזר JSON בלבד עבור המוצר: "${productName}".
        פורמט: {"name": "...", "desc": "...", "specs": {"weight": "...", "cover": "...", "dry": "..."}, "category": "cement|glue|paint|tools"}`;

        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        
        let text = await this.fetchGemini(payload);

        // אם ה-AI נכשל, נפעיל סימולציה
        if (!text) {
            console.error("Gemini Search failed. Using SIMULATION.");
            return this.simulateProductData(productName);
        }

        try {
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const productData = JSON.parse(text);
            
            // העשרת נתונים
            productData.img = `https://source.unsplash.com/400x400/?construction,${encodeURIComponent(productData.category || 'tool')}`;
            productData.price = Math.floor(Math.random() * 200) + 50; 
            productData.sku = "AI-" + Math.floor(Math.random() * 9999);
            
            return productData;
        } catch (e) {
            console.error("JSON Parse Error, using simulation");
            return this.simulateProductData(productName);
        }
    },

    // --- מנועי הסימולציה (גיבוי) ---
    simulateResponse(prompt) {
        if (prompt.includes("מלט")) return "לפי התחשיב: כ-12 שקים לכיסוי סטנדרטי.";
        if (prompt.includes("דבק")) return "מומלץ דבק 114 או 109, זמן עבודה שעתיים.";
        return "המערכת במצב לא מקוון, אך השאלה נרשמה.";
    },

    simulateProductData(term) {
        const type = term.includes("מקדח") ? "tools" : term.includes("צבע") ? "paint" : "cement";
        return {
            name: term + " (מוצר הדגמה)",
            desc: "מוצר זה נוצר אוטומטית עקב בעיית תקשורת.",
            specs: { weight: "25 קג", cover: "10 מ\"ר", dry: "24 שעות" },
            category: type,
            price: 150,
            sku: "DEMO-999",
            img: `https://source.unsplash.com/400x400/?construction,${type}`
        };
    }
};
