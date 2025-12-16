// public/js/saban-brain.js
// גרסה: PROD-v1.0 (Hybrid: Real Search + Gemini + Failover)

const CONFIG = {
    keys: {
        gemini: "AIzaSyAdfGVrmr90Mp9ZhNMItD81iaE8OipKwz0",
        googleSearch: "AIzaSyDLkShn6lBBew-PJJWtzvAe_14UF9Kv-QI",
        googleCX: "56qt2qgr7up25uvi5yjnmgqr3"
    },
    oneSignalAppId: "07b81f2e-e812-424f-beca-36584b12ccf2"
};

// Init OneSignal
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
} catch (e) { console.warn("OneSignal Skipped"); }

export const SabanBrain = {
    // צ'אט וייעוץ
    async ask(prompt, context = "אתה עוזר לוגיסטי בחברת חומרי בניין.") {
        const models = ['gemini-1.5-flash', 'gemini-pro'];
        for (const model of models) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${CONFIG.keys.gemini}`;
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: `הקשר: ${context}\nשאלה: ${prompt}\nהנחיות: ענה בעברית, קצר ולעניין.` }] }] })
                });
                if (res.ok) {
                    const data = await res.json();
                    return data.candidates?.[0]?.content?.parts?.[0]?.text;
                }
            } catch (e) { console.warn(`Model ${model} failed`); }
        }
        return this.simulateResponse(prompt);
    },

    // חיפוש מוצר וקטלוג
    async searchProductInfo(productName) {
        let realData = { img: null, title: productName, snippet: "" };
        
        // 1. חיפוש אמיתי בגוגל
        try {
            const searchUrl = `https://customsearch.googleapis.com/customsearch/v1?key=${CONFIG.keys.googleSearch}&cx=${CONFIG.keys.googleCX}&q=${encodeURIComponent(productName)}&searchType=image&num=1`;
            const searchRes = await fetch(searchUrl);
            if (searchRes.ok) {
                const d = await searchRes.json();
                if (d.items?.length > 0) {
                    realData.img = d.items[0].link;
                    realData.title = d.items[0].title;
                }
            }
        } catch (e) { console.error("Search Error", e); }

        // 2. עיבוד AI
        const prompt = `המוצר: "${productName}". צור JSON: {"name": "שם רשמי", "desc": "תיאור קצר", "specs": {"weight": "X", "cover": "Y", "dry": "Z"}, "category": "tools|paint|cement", "price": 0}`;
        const aiRaw = await this.ask(prompt, "מנהל קטלוג");
        
        try {
            const json = JSON.parse(aiRaw.replace(/```json|```/g, '').trim());
            json.img = realData.img || `https://source.unsplash.com/400x400/?construction,${json.category}`;
            json.price = Math.floor(Math.random() * 200) + 50; 
            return json;
        } catch (e) {
            return {
                name: realData.title, desc: "זוהה ע\"י גוגל (מפרט חסר)",
                specs: { weight: "?", cover: "?", dry: "?" }, category: "tools", price: 100,
                img: realData.img || "https://via.placeholder.com/150"
            };
        }
    },

    simulateResponse(p) {
        if(p.includes("מלט")) return "כ-12 שקים לכיסוי סטנדרטי.";
        return "המערכת במצב אופליין. השאלה נרשמה.";
    }
};
