export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext; 
        this.knowledgeBase = [];
    }

    async loadTemplates() {
        try {
            const response = await fetch('templates.json');
            this.knowledgeBase = await response.json();
        } catch (e) { console.error("Error loading templates", e); }
    }

    async ask(question) {
        if (this.knowledgeBase.length === 0) await this.loadTemplates();

        // 1. DRIVER LOGIC (NEW)
        const driverResponse = this.checkDriverLogic(question);
        if (driverResponse) return driverResponse;

        // 2. CONTAINER LOGIC
        const containerResponse = this.checkContainerLogic(question);
        if (containerResponse) return containerResponse;

        // 3. STANDARD SEARCH
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
            return { text: "מצטער, לא הבנתי בדיוק. נסה לשאול על 'מכולה', 'דבק' או 'מנוף'.", action: "TRIGGER_GOOGLE_SEARCH", query: question };
        }
    }

    // --- DRIVER LOGIC ---
    checkDriverLogic(text) {
        if (text.includes("מנוף") || text.includes("קומה")) {
            return {
                text: "הבנתי, מנוף. 🏗️<br>זה התחום של <b>חכמת</b> (משאית המנוף שלנו).<br>שים לב שהגובה המקסימלי הוא קומה 3-4.<br>האם הגישה פנויה מכבלי חשמל?",
                buttons: [{ label: "כן, גישה פנויה", action: "next_node", payload: "crane_ok" }]
            };
        }
        if (text.includes("ידני") || text.includes("סבלות")) {
            return {
                text: "פריקה ידנית? 💪<br>אני משבץ את <b>עלי</b> למשימה.<br>שים לב שפריקה ידנית כרוכה בתוספת תשלום לקומה.",
                buttons: [{ label: "מאשר תוספת", action: "next_node", payload: "manual_ok" }]
            };
        }
        return null;
    }

    checkContainerLogic(text) {
        if (text.includes("מכולה") && (text.includes("הרצליה") || text.includes("רעננה"))) {
            const city = text.includes("הרצליה") ? "herzliya" : "raanana";
            const template = this.knowledgeBase.find(t => t.scenarioId === `permit_${city}`);
            if (template) return { text: template.answer.replace("{name}", this.user.name), buttons: template.buttons };
        }
        return null;
    }
}
