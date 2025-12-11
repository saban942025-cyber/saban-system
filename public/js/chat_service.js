// public/js/chat_service.js
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export class ChatBotService {
    constructor(db) {
        this.db = db;
        this.faqCache = [];
        this.loadFAQ();
    }

    async loadFAQ() {
        try {
            const snap = await getDocs(collection(this.db, "faq"));
            this.faqCache = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error loading FAQ", e);
        }
    }

    async processMessage(userText) {
        const text = userText.toLowerCase().trim();
        
        let bestMatch = null;
        let maxScore = 0;

        this.faqCache.forEach(item => {
            let score = 0;
            if (item.keywords && Array.isArray(item.keywords)) {
                item.keywords.forEach(keyword => {
                    if (text.includes(keyword.toLowerCase())) score++;
                });
            }
            if (score > maxScore) {
                maxScore = score;
                bestMatch = item;
            }
        });

        const sessionId = this.getSessionId();

        if (bestMatch && maxScore > 0) {
            this.logInteraction(sessionId, text, bestMatch.category, true);
            return { text: bestMatch.answer };
        } else {
            this.logInteraction(sessionId, text, 'unknown', false);
            this.logUnanswered(text);
            return { text: "לא מצאתי תשובה מדויקת במאגר. אעביר את השאלה לנציג אנושי." };
        }
    }

    async logInteraction(sessionId, question, category, answered) {
        addDoc(collection(this.db, "chat_logs"), { sessionId, question, category, answered, timestamp: serverTimestamp() });
    }

    async logUnanswered(question) {
        const q = query(collection(this.db, "unanswered_questions"), where("question", "==", question));
        const snap = await getDocs(q);
        if (snap.empty) {
            addDoc(collection(this.db, "unanswered_questions"), { question, count: 1, timestamp: serverTimestamp() });
        }
    }

    getSessionId() {
        let id = localStorage.getItem('saban_chat_session');
        if (!id) {
            id = 'anon_' + Date.now();
            localStorage.setItem('saban_chat_session', id);
        }
        return id;
    }
}