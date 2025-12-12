// public/js/chatbot-engine.js
import { SabanPush } from './notifications.js'; // ייבוא

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext; 
        this.knowledgeBase = [];
    }

    // ... (טעינת תבניות) ...

    async ask(question) {
        // ... (לוגיקה קיימת) ...

        // דוגמה לשימוש בהתראה:
        if (question.includes("דחוף")) {
            // אם הלקוח כותב "דחוף", הבוט שולח התראה למנהל (רמי)
            SabanPush.send('admin_rami', 'לקוח במצוקה!', `הלקוח ${this.user.name} כתב דחוף בצ'אט.`);
            return { text: "העברתי התראה דחופה למנהל. מיד איתך." };
        }

        // ... (המשך לוגיקה) ...
        return { text: "לא הבנתי." };
    }
}
