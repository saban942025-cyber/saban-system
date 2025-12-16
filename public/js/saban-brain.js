// public/js/saban-brain.js
// גרסה: PRODUCTION v1.0 🚀

const CONFIG = {
    keys: {
        gemini: "AIzaSyAdfGVrmr90Mp9ZhNMItD81iaE8OipKwz0",
        googleSearch: "AIzaSyDLkShn6lBBew-PJJWtzvAe_14UF9Kv-QI",
        googleCX: "56qt2qgr7up25uvi5yjnmgqr3"
    },
    // הגשר האוטומטי לקומקס
    comaxBridgeUrl: "https://script.google.com/macros/s/AKfycby9KVjix6KNvctLBoEAqOihyOGzyvspprG7_-1kedDDI6Xjwht7eqNO2POww77Jink/exec",
    oneSignalAppId: "07b81f2e-e812-424f-beca-36584b12ccf2"
};

// אתחול OneSignal
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
    
    // פונקציית סנכרון ידני (גיבוי)
    async syncComax() {
        console.log("🔄 מסנכרן מול גשר קומקס...");
        try {
            await fetch(CONFIG.comaxBridgeUrl, { method: 'GET', mode: 'no-cors' });
            return "פקודת סנכרון נשלחה.";
        } catch (e) {
            console.error("Sync Error", e);
            return "שגיאה בסנכרון.";
        }
    },

    // AI Chat
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
        return "המערכת במצב אופליין.";
    },

    // Product Search Hybrid
    async searchProductInfo(productName) {
        let realData = { img: null, title: productName };
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

        // Fallback or Enrichment logic can go here
        return {
            name: realData.title,
            desc: "זוהה ע\"י גוגל",
            specs: { weight: "סטנדרט", cover: "-", dry: "-" },
            category: "general",
            price: 0,
            img: realData.img || "https://via.placeholder.com/150"
        };
    }
};
