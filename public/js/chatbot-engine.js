export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext; 
        this.knowledgeBase = []; 
        // הגדרת מרכז לוגיסטי לצורך חישובים (טייבה)
        this.storeLocation = { lat: 32.263, lng: 35.005 }; 
    }

    async loadTemplates() {
        try {
            const response = await fetch('templates.json');
            this.knowledgeBase = await response.json();
        } catch (e) { 
            console.warn("Could not load local templates, using fallback.");
            this.knowledgeBase = [];
        }
    }

    async ask(question) {
        if (this.knowledgeBase.length === 0) await this.loadTemplates();

        // 1. בדיקת לוגיסטיקה חיה (Logistics First)
        if (this.isLogisticsQuestion(question)) {
            return await this.handleLogisticsQuery();
        }

        // 2. לוגיקה עסקית (Geo-Fencing)
        const logicResponse = this.checkContainerLogic(question);
        if (logicResponse) return logicResponse;

        // 3. חיפוש רגיל (Templates)
        return this.findBestTemplateMatch(question);
    }

    isLogisticsQuestion(text) {
        const keywords = ["מתי", "זמן", "הגעה", "איפה", "נהג", "דקות", "משלוח"];
        return keywords.some(kw => text.includes(kw));
    }

    async handleLogisticsQuery() {
        // סימולציה של שליפת מיקום נהג מה-DB
        const driverDist = Math.floor(Math.random() * 15) + 2; // 2-17 ק"מ
        const timePerKm = 1.8; // דקות לק"מ (כולל פקקים)
        const eta = Math.floor(driverDist * timePerKm);

        return {
            text: `בדקתי במערכת הלוויינית 🛰️\nהנהג שלנו נמצא במרחק ${driverDist} ק"מ ממך.\n**זמן הגעה משוער: ${eta} דקות.**`,
            buttons: [
                { label: "📍 צפה במפה LIVE", action: "open_map" },
                { label: "📞 התקשר לנהג", action: "call_driver" }
            ]
        };
    }

    checkContainerLogic(text) {
        // היתרים גיאוגרפיים
        if (text.includes("מכולה") && (text.includes("הרצליה") || text.includes("רעננה"))) {
            const city = text.includes("הרצליה") ? "הרצליה" : "רעננה";
            return {
                text: `שים לב: להזמנת מכולה ב${city} חובה לצרף היתר עירייה בתוקף.\nהאם יש לך היתר?`,
                buttons: [
                    { label: "✅ יש לי היתר", action: "upload_permit" },
                    { label: "❌ אין לי", action: "info_permit" }
                ]
            };
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
            return { 
                text: bestMatch.answer.replace("{name}", this.user.name || "חבר"), 
                buttons: bestMatch.buttons 
            };
        } 
        
        return { 
            text: "לא בטוח שהבנתי. אני יודע לענות על מכולות, חומרי בניין וזמני הגעה.",
            buttons: [
                { label: "מתי מגיע?", action: "check_eta" },
                { label: "תפריט ראשי", action: "menu" }
            ]
        };
    }
}
