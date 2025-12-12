// public/js/presence.js
import { getFirestore, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// פונקציה להפעלת מנגנון הנוכחות
export function initPresence(app) {
    const auth = getAuth(app);
    const db = getFirestore(app);

    auth.onAuthStateChanged((user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            
            // עדכון ראשוני
            updateStatus(userRef);

            // עדכון כל דקה (דופק)
            setInterval(() => updateStatus(userRef), 60000);

            // עדכון ביציאה/חזרה לטאב
            document.addEventListener("visibilitychange", () => {
                if (document.visibilityState === 'visible') updateStatus(userRef);
            });
        }
    });
}

async function updateStatus(ref) {
    try {
        await updateDoc(ref, {
            isOnline: true,
            lastSeen: serverTimestamp()
        });
    } catch (e) { console.error("Presence error", e); }
}
