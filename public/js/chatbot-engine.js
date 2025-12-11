export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext; 
        this.knowledgeBase = []; // יטען מ-JSON בפועל
    }

    // טעינת התבניות (אם לא נטענו מבחוץ)
    async loadTemplates() {
        try {
            const response = await fetch('templates.json');
            this.knowledgeBase = await response.json();
        } catch (e) { console.error("Error loading templates", e); }
    }

    async ask(question) {
        // וודא שטעינו תבניות
        if (this.knowledgeBase.length === 0) await this.loadTemplates();

        // 1. זיהוי "מכולה" + עיר (לוגיקה חכמה)
        const logicResponse = this.checkContainerLogic(question);
        if (logicResponse) return logicResponse;

        // 2. חיפוש רגיל בתבניות
        let bestMatch = null;
        let maxScore = 0;

        this.knowledgeBase.forEach(item => {
            let score = 0;
            item.keywords.forEach(kw => {
                if (question.includes(kw)) score++;
            });
            if (score > maxScore) { maxScore = score; bestMatch = item; }
        });

        if (bestMatch && maxScore > 0) {
            return {
                text: bestMatch.answer.replace("{name}", this.user.name || "חבר"),
                buttons: bestMatch.buttons
            };
        } else {
            return {
                text: "מצטער, לא הבנתי בדיוק. נסה לשאול על 'מכולה', 'דבק' או 'הובלה'.",
                action: "TRIGGER_GOOGLE_SEARCH",
                query: question
            };
        }
    }

    // --- המוח של המכולות ---
    checkContainerLogic(text) {
        // בדיקת היתרים לפי עיר
        if (text.includes("מכולה") && (text.includes("הרצליה") || text.includes("רעננה"))) {
            const city = text.includes("הרצליה") ? "herzliya" : "raanana";
            // שליפת התבנית המתאימה
            const template = this.knowledgeBase.find(t => t.scenarioId === `permit_${city}`);
            if (template) {
                return {
                    text: template.answer.replace("{name}", this.user.name),
                    buttons: template.buttons
                };
            }
        }
        return null;
    }
}
