// public/js/chat_service.js
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export class ChatBotService {
    constructor(db) {
        this.db = db;
        this.faqCache = [];
        this.loadFAQ();
    }

    async loadFAQ() {
        // טוען את השאלות לזיכרון כדי שהתגובה תהיה מהירה
        const snap = await getDocs(collection(this.db, "faq"));
        this.faqCache = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // הפונקציה הראשית שמקבלת טקסט ומחזירה תשובה
    async processMessage(userText) {
        const text = userText.toLowerCase().trim();
        
        // 1. נסה למצוא התאמה במוצרים (לוגיקה קיימת)
        // (זה יתבצע בצד הלקוח או כאן אם נרצה לשלב)

        // 2. חיפוש במאגר ה-FAQ
        let bestMatch = null;
        let maxScore = 0;

        this.faqCache.forEach(item => {
            let score = 0;
            item.keywords.forEach(keyword => {
                if (text.includes(keyword.toLowerCase())) score++;
            });
            
            // חישוב ניקוד: אם נמצא יותר ממילת מפתח אחת, הציון עולה
            if (score > maxScore) {
                maxScore = score;
                bestMatch = item;
            }
        });

        const sessionId = this.getSessionId();

        // 3. החזרת תשובה ושמירת לוגים
        if (bestMatch && maxScore > 0) {
            await this.logInteraction(sessionId, text, bestMatch.category, true);
            return { 
                text: bestMatch.answer, 
                type: 'faq', 
                relatedCategory: bestMatch.category 
            };
        } else {
            // לא נמצאה תשובה
            await this.logInteraction(sessionId, text, 'unknown', false);
            await this.logUnanswered(text); // שמירה לעריכה עתידית ע"י מנהל
            return { 
                text: "מצטער, לא מצאתי תשובה מדויקת במאגר שלי. העברתי את השאלה לנציג אנושי שיחזור אליך, או שנסה לנסח מחדש.", 
                type: 'fallback' 
            };
        }
    }

    // תיעוד השיחה לאנליטיקה
    async logInteraction(sessionId, question, category, answered) {
        try {
            await addDoc(collection(this.db, "chat_logs"), {
                sessionId,
                question,
                category,
                answered,
                timestamp: serverTimestamp()
            });
        } catch (e) { console.error("Log Error", e); }
    }

    // שמירת שאלות שהבוט נכשל בהן
    async logUnanswered(question) {
        try {
            // בדיקה אם השאלה כבר קיימת כדי לא להציף
            const q = query(collection(this.db, "unanswered_questions"), where("question", "==", question));
            const snap = await getDocs(q);
            if (snap.empty) {
                await addDoc(collection(this.db, "unanswered_questions"), {
                    question,
                    count: 1,
                    firstSeen: serverTimestamp(),
                    lastSeen: serverTimestamp()
                });
            }
        } catch (e) { console.error("Unanswered Log Error", e); }
    }

    getSessionId() {
        let id = localStorage.getItem('saban_chat_session');
        if (!id) {
            id = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('saban_chat_session', id);
        }
        return id;
    }
}