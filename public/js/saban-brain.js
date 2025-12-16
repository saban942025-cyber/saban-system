// public/js/saban-brain.js
// גרסה: Super-Brain Hybrid (חיפוש אמיתי + דיאגנוסטיקה ל-Gemini)

const CONFIG = {
    keys: {
        gemini: "AIzaSyAdfGVrmr90Mp9ZhNMItD81iaE8OipKwz0", // המפתח שצריך לחקור
        googleSearch: "AIzaSyDLkShn6lBBew-PJJWtzvAe_14UF9Kv-QI", // המפתח התקין ✅
        googleCX: "56qt2qgr7up25uvi5yjnmgqr3"               // ה-CX התקין ✅
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
} catch (e) { console.warn("OneSignal Skipped"); }

export const SabanBrain = {

    /**
     * פונקציית חקירת שגיאות Gemini
     * מדפיסה לקונסול את הסיבה המדויקת לכשל
     */
    logGeminiError(errorData, status) {
        console.group("%c🚨 Gemini Investigation Report", "color: red; font-weight: bold; font-size: 14px;");
        console.error(`Status Code: ${status}`);
        
        let reason = "שגיאה לא ידועה";
        if (status === 403) reason = "חסימת גישה: בדוק 'Websites Restriction' בקונסול או שלא הפעלת את ה-API.";
        if (status === 404) reason = "מודל לא נמצא: המפתח לא משויך למודל הזה או כתובת לא נכונה.";
        if (status === 400) reason = "בקשה לא תקינה: מפתח שגוי.";
        
        console.error(`Diagnosis: ${reason}`);
        console.error("Full Details:", errorData);
        console.groupEnd();
    },

    // 1. שאילתה ל-Gemini (עם מנגנון גיבוי כפול וחקירה)
    async ask(prompt, context = "אתה עוזר לוגיסטי.") {
        const models = ['gemini-1.5-flash', 'gemini-pro'];
        
        for (const model of models) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${CONFIG.keys.gemini}`;
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: `הקשר: ${context}\nשאלה: ${prompt}\nהנחיות: ענה בעברית, קצר ולעניין.` }] }] })
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.candidates?.[0]?.content?.parts?.[0]?.text;
                } else {
                    // 🚨 כאן מתבצעת החקירה אם נכשל
                    const err = await response.json();
                    this.logGeminiError(err, response.status);
                }
            } catch (e) { console.warn(`Model ${model} network error`); }
        }
        
        return "המערכת במצב לא מקוון (ראה קונסול לסיבת הכשל): " + this.simulateResponse(prompt);
    },

    // 2. חיפוש מוצר (השילוב האמיתי: Google Search + Gemini)
    async searchProductInfo(productName) {
        let realData = { img: null, title: productName, snippet: "" };

        // שלב א': חיפוש אמיתי בגוגל (אנחנו יודעים שזה עובד!)
        try {
            console.log("🔍 מפעיל חיפוש גוגל עבור:", productName);
            const searchUrl = `https://customsearch.googleapis.com/customsearch/v1?key=${CONFIG.keys.googleSearch}&cx=${CONFIG.keys.googleCX}&q=${encodeURIComponent(productName)}&searchType=image&num=1`;
            
            const searchRes = await fetch(searchUrl);
            if (searchRes.ok) {
                const searchData = await searchRes.json();
                if (searchData.items && searchData.items.length > 0) {
                    realData.img = searchData.items[0].link;
                    realData.title = searchData.items[0].title;
                    realData.snippet = searchData.items[0].snippet || "";
                    console.log("✅ נמצאה תמונה אמיתית:", realData.img);
                }
            } else {
                console.warn("⚠️ חיפוש גוגל נכשל (בדוק מכסה/מפתח Search)");
            }
        } catch (e) { console.error("Search Network Error", e); }

        // שלב ב': ניסיון עיבוד עם Gemini
        const prompt = `
        המשתמש חיפש: "${productName}". מצאתי בגוגל: "${realData.snippet}".
        צור JSON למוצר (אם אין מידע, המצא מפרט הגיוני):
        {
            "name": "${realData.title.replace(/"/g, '')}",
            "desc": "תיאור קצר ומקצועי בעברית (עד 15 מילים)",
            "specs": {"weight": "משקל בקג", "cover": "כיסוי במר", "dry": "זמן ייבוש"},
            "category": "cement|glue|paint|tools",
            "price": 0
        }`;

        // שליחה ל-Gemini
        const aiResponse = await this.ask(prompt, "אתה מנהל קטלוג.");
        
        // שלב ג': פענוח או גיבוי
        try {
            // ניקוי התשובה מסימונים מיותרים
            const cleanJson = aiResponse.replace(/```json|```/g, '').trim();
            
            // אם Gemini נכשל והחזיר הודעת שגיאה במקום JSON, נשתמש בגיבוי
            if (!cleanJson.startsWith('{')) throw new Error("Gemini returned invalid JSON");

            const productData = JSON.parse(cleanJson);

            // שימוש בתמונה האמיתית שמצאנו (או פלייסהולדר אם אין)
            productData.img = realData.img || `https://source.unsplash.com/400x400/?construction,${productData.category}`;
            productData.price = Math.floor(Math.random() * 200) + 50; 
            productData.sku = "G-" + Math.floor(Math.random() * 9999);

            return productData;

        } catch (e) {
            console.error("AI processing failed, using raw search data + simulation.");
            
            // יצירת אובייקט חצי-אמיתי (תמונה מגוגל, טקסט מסימולציה)
            return {
                name: realData.title,
                desc: "מוצר זה זוהה בגוגל, אך המפרט הטכני מסומלץ עקב תקלת AI.",
                specs: { weight: "?", cover: "?", dry: "?" },
                category: "tools",
                price: 120,
                sku: "GOOGLE-ONLY",
                img: realData.img || "https://via.placeholder.com/150"
            };
        }
    },

    // --- גיבויים ---
    simulateResponse(prompt) {
        if (prompt.includes("מלט")) return "כ-12 שקים לכיסוי סטנדרטי.";
        return "תקלה בחיבור למוח (Gemini). המידע נשמר.";
    }
};

