export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext; // מי הלקוח (שחר שאול)
        
        // ידע בסיסי "צרוב" (בהמשך יבוא מהדאטה בייס)
        this.knowledgeBase = [
            {
                keywords: ["דבק", "קרמיקה", "חוץ", "מרפסת"],
                recommendedSku: "114255", // סיקה 255
                reason: "עמידות גבוהה לתנאי חוץ וגמישות S1",
                tip: "אל תשכח למרוח גם על גב האריח (Back Buttering)"
            },
            {
                keywords: ["איטום", "מקלחת", "אמבטיה"],
                recommendedSku: "50201", // סיקה טופ 107
                reason: "איטום צמנטי מעולה לחדרים רטובים",
                tip: "חובה רולקות בחיבורים לפני היישום"
            }
        ];
    }

    // הפונקציה הראשית: הלקוח שואל
    async ask(question) {
        console.log(`Analyzing question: ${question}...`);

        // 1. ניתוח מילות מפתח
        const words = question.toLowerCase().split(" ");
        
        // 2. חיפוש במוח
        let bestMatch = null;
        let maxScore = 0;

        this.knowledgeBase.forEach(item => {
            let score = 0;
            item.keywords.forEach(kw => {
                if (question.includes(kw)) score++;
            });
            
            if (score > maxScore) {
                maxScore = score;
                bestMatch = item;
            }
        });

        // 3. ניסוח תשובה מותאמת אישית
        if (bestMatch && maxScore > 0) {
            // שליפת פרטי מוצר מלאים (מחיר, מלאי) מהקטלוג שלנו
            // (כאן נכנס החיבור לקוד הקודם שלנו)
            
            return {
                text: `היי ${this.user.name}, לפרויקט שלך אני ממליץ על המוצר הזה:`,
                sku: bestMatch.recommendedSku,
                reason: bestMatch.reason,
                proTip: bestMatch.tip,
                confidence: "High"
            };
        } else {
            // 4. אם הבוט לא יודע -> הפעלת "סוכן נתנאל" (חיפוש בגוגל)
            return {
                text: "שאלה מעולה. אני בודק מפרטים טכניים ברשת...",
                action: "TRIGGER_GOOGLE_SEARCH",
                query: question
            };
        }
    }

    // פונקציית למידה: הלקוח תיקן אותנו
    async learn(question, correctSku) {
        // שמירה לפיירבייס לניתוח עתידי
        const learningData = {
            question: question,
            user_choice: correctSku,
            timestamp: new Date()
        };
        console.log("Learning new pattern:", learningData);
        // await addDoc(collection(this.db, "bot_learning"), learningData);
    }
}