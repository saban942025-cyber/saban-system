import { SabanPush } from './notifications.js';
import { SabanSounds } from './sounds.js';
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext; 
        
        // חוקים קבועים (חירום, סמול טוק וכו')
        this.rules = [
            {
                category: "EMERGENCY",
                keywords: ["דחוף", "בהול", "עצור", "תעצור", "טעות", "תקלה"],
                answer: "🛑 עצרתי הכל! הקפצתי התראה אדומה לכל המנהלים (רמי/אורן).\nאני מחייג אליך או שולח נציג לצ'אט מיד.",
                action: "urgent_alert"
            },
            {
                category: "CONTAINERS",
                keywords: ["מכולה", "8 קוב", "פינוי פסולת"],
                answer: "אין בעיה, נארגן מכולה 8 קוב. 🚛\nלאיזו עיר המכולה מיועדת? (בת\"א/הרצליה חובה היתר הצבה).",
                buttons: [{ label: "🏙️ תל אביב", payload: "TLV" }, { label: "🏠 עיר אחרת", payload: "OTHER" }]
            },
            {
                category: "SMALL_TALK",
                keywords: ["תודה", "אלוף", "בוקר טוב", "היי", "שלום"],
                answer: "בכיף {name}! אני כאן לכל מה שצריך. 💪",
                buttons: []
            }
        ];
    }

    // --- הפונקציה הראשית שרצה בכל הודעה ---
    async ask(question) {
        if (!question) return null;
        const cleanQ = question.toLowerCase();

        // 1. בדיקה מול חוקים קבועים (Rules)
        for (const rule of this.rules) {
            if (rule.keywords.some(kw => cleanQ.includes(kw))) {
                if (rule.action === 'urgent_alert') {
                    if(SabanSounds) SabanSounds.playAlert();
                    await SabanPush.send('admin_rami', '🚨 דחוף', `${this.user.name}: ${question}`);
                } else {
                    if(SabanSounds) SabanSounds.playMessage();
                }
                return { 
                    text: rule.answer.replace("{name}", this.user.name || "חבר"), 
                    buttons: rule.buttons || [],
                    action: rule.action 
                };
            }
        }

        // 2. חיפוש מוצר ב-Firebase (בדיקת מלאי חכמה) 🧠
        // אם לא מצאנו חוק, נבדוק אם המשתמש שאל על מוצר מהקטלוג
        try {
            const productsRef = collection(this.db, "products");
            const snapshot = await getDocs(productsRef);
            
            // חיפוש בתוך המוצרים (האם שם המוצר מופיע בשאלה?)
            const foundProduct = snapshot.docs.find(doc => {
                const p = doc.data();
                return p.core && p.core.name && cleanQ.includes(p.core.name.toLowerCase()); // חיפוש לפי שם
            });

            if (foundProduct) {
                const productData = foundProduct.data();
                
                // --- כאן אנחנו משתמשים בפונקציה שלך! ---
                const stockMsg = this.checkStockLogic(productData);
                
                // בונים תשובה מלאה
                let fullAnswer = `מצאתי את המוצר: **${productData.core.name}**\nמחיר: ₪${productData.core.price}\n\n${stockMsg}`;
                
                // הוספת מידע טכני אם יש
                if(productData.chatbot) {
                    if(productData.chatbot.drying_time) fullAnswer += `\n⏳ זמן ייבוש: ${productData.chatbot.drying_time}`;
                }

                return {
                    text: fullAnswer,
                    buttons: [
                        { label: "הוסף לעגלה 🛒", payload: `ADD_${foundProduct.id}` },
                        { label: "פרטים נוספים ℹ️", payload: `INFO_${foundProduct.id}` }
                    ]
                };
            }
        } catch (e) {
            console.error("Error searching products:", e);
        }

        // 3. Fallback (לא הבנתי)
        return { 
            text: "שאלה טובה... אני בודק את זה רגע מול רמי/אורן וחוזר אליך. ⏳", 
            action: "fallback" 
        };
    }

    // --- הפונקציה שלך (משולבת במחלקה) ---
    checkStockLogic(product) {
        if (!product || !product.core) return "מידע על מלאי לא זמין."; // הגנה משגיאות

        const loc = product.core.warehouse || 'both'; // ברירת מחדל
        const productName = product.core.name;

        if (loc === 'both') {
            return `יש חדשות טובות! ה-${productName} זמין במלאי גם בחרש וגם בתלמיד. 🟢\nמאיפה נוח לך לאסוף?`;
        } 
        else if (loc === 'harash') {
            return `שים לב: ה-${productName} נמצא כרגע רק בסניף **החרש**. 📍\nסניף התלמיד חסר כרגע. לשריין לך בחרש?`;
        } 
        else if (loc === 'talmid') {
            return `בדיקה במערכת מראה שהמוצר זמין בסניף **התלמיד** בלבד. 📍\nתרצה שאפתח משימת ליקוט להעברה לחרש, או שתאסוף משם?`;
        }
        return `נראה שהמוצר חסר זמנית בשני הסניפים. 🔴`;
    }
}
