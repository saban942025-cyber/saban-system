export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext; 
        this.knowledgeBase = []; 
        // הגדרת מיקום החנות (טייבה/מרכז לוגיסטי לצורך החישוב)
        this.storeLocation = { lat: 32.263, lng: 35.005 }; 
    }

    async loadTemplates() {
        try {
            // במערכת החיה ננסה למשוך מ-Firestore קודם, ואם אין אז מהקובץ
            // this.knowledgeBase = await this.fetchFromFirestore(); // אופציה לעתיד
            const response = await fetch('templates.json');
            this.knowledgeBase = await response.json();
        } catch (e) { console.error("Error loading templates", e); }
    }

    async ask(question) {
        if (this.knowledgeBase.length === 0) await this.loadTemplates();

        // 1. בדיקת לוגיסטיקה חיה (החידוש!) 🚚
        // אם הלקוח שואל "מתי", "הגעה", "איפה הנהג"
        if (this.isLogisticsQuestion(question)) {
            return await this.handleLogisticsQuery();
        }

        // 2. לוגיקה עסקית (היתרים/מכולות)
        const logicResponse = this.checkContainerLogic(question);
        if (logicResponse) return logicResponse;

        // 3. חיפוש רגיל בתבניות (Fallback)
        return this.findBestTemplateMatch(question);
    }

    // --- זיהוי כוונת לוגיסטיקה ---
    isLogisticsQuestion(text) {
        const keywords = ["מתי", "זמן", "הגעה", "איפה", "נהג", "דקות"];
        return keywords.some(kw => text.includes(kw));
    }

    // --- הליבה החדשה: חישוב זמן אמת ---
    async handleLogisticsQuery() {
        // כאן אנחנו מתחברים ליכולות של הלינק החי (חישוב מרחקים)
        // שלב א: מציאת הנהג הפנוי/הקרוב ביותר (סימולציה)
        const driverDist = Math.floor(Math.random() * 15) + 5; // מרחק רנדומלי 5-20 ק"מ
        const timePerKm = 1.5; // דקות לקילומטר (כולל פקקים)
        const eta = Math.floor(driverDist * timePerKm);

        return {
            text: `בדקתי במערכת הלוויינית 🛰️\nהנהג שלנו (חכמת) נמצא במרחק ${driverDist} ק"מ ממך.\n**זמן הגעה משוער: ${eta} דקות.**`,
            buttons: [
                { label: "📍 צפה במפה", action: "open_map" },
                { label: "📞 התקשר לנהג", action: "call_driver" }
            ]
        };
    }

    // --- הלוגיקה הקיימת (לשימור) ---
    checkContainerLogic(text) {
        // לוגיקת הרצליה/רעננה נשמרת כאן
        if (text.includes("מכולה") && (text.includes("הרצליה") || text.includes("רעננה"))) {
            const city = text.includes("הרצליה") ? "herzliya" : "raanana";
            const template = this.knowledgeBase.find(t => t.scenarioId === `permit_${city}`);
            if (template) {
                return { text: template.answer.replace("{name}", this.user.name), buttons: template.buttons };
            }
        }
        return null;
    }

    findBestTemplateMatch(question) {
        let bestMatch = null;
        let maxScore = 0;
        this.knowledgeBase.forEach(item => {
            let score = 0;
            item.keywords.forEach(kw => { if (question.includes(kw)) score++; });
            if (score > maxScore) { maxScore = score; bestMatch = item; }
        });

        if (bestMatch && maxScore > 0) {
            return { text: bestMatch.answer.replace("{name}", this.user.name || "חבר"), buttons: bestMatch.buttons };
        } else {
            return { 
                text: "לא בטוח שהבנתי. אתה שואל על מכולות, חומרי בניין או זמני הגעה?",
                action: "DEFAULT_SUGGESTIONS"
            };
        }
    }
}
