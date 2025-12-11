// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA3qwgBX69Clu7pUdOnOEcfzUVyR7ADrNc",
  authDomain: "saban94-eb5f0.firebaseapp.com",
  projectId: "saban94-eb5f0",
  // ... שאר ההגדרות שלך נשארות אותו דבר
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- רשימת המאסטרים (Iron List) ---
const MASTER_EMAILS = [
    "ramims@saban94.co.il", 
    "rami.msarwa1@gmail.com"
];

// פונקציה לבדיקה אם המשתמש הוא מאסטר
function isMasterUser(user) {
    if (!user) return false;
    return MASTER_EMAILS.includes(user.email);
}

export { db, auth, isMasterUser };