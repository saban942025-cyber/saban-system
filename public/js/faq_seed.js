// public/js/faq_seed.js
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const initialFAQ = [
    { keywords: ["דבק", "קרמיקה", "109", "114"], answer: "לגרניט פורצלן מומלץ להשתמש בדבק 109 או 114. יש במלאי.", category: "adhesives" },
    { keywords: ["רובה", "אקרילית"], answer: "יש לנו רובה אקרילית במגוון צבעים של טמבור ונירלט.", category: "adhesives" },
    { keywords: ["חול", "שק", "בלה"], answer: "חול נמכר בשקים קטנים או בבלות ענק (כ-500 ליטר).", category: "quarry" },
    { keywords: ["מנוף", "הובלה"], answer: "משאיות המנוף שלנו מגיעות עד קומה 6-7. צור קשר להצעת מחיר.", category: "transport" },
    { keywords: ["שעות", "פתוח"], answer: "ימים א'-ה' 07:00-17:00, ימי ו' עד 13:00.", category: "general" },
    { keywords: ["טלפון", "מספר"], answer: "להזמנות: 972508860896.", category: "general" },
    { keywords: ["מיקום", "כתובת"], answer: "אזור התעשייה טייבה, חפש ב-Waze.", category: "general" },
    { keywords: ["גבס", "לוח"], answer: "לוחות גבס רגיל, ירוק ואדום במלאי.", category: "drywall" }
];

export async function seedFAQ(db) {
    const colRef = collection(db, "faq");
    const snap = await getDocs(colRef);
    if (!snap.empty) {
        console.log("FAQ already seeded.");
        alert("המאגר כבר מלא! אין צורך לטעון שוב.");
        return;
    }
    
    console.log("Seeding FAQ...");
    const promises = initialFAQ.map(item => addDoc(colRef, item));
    await Promise.all(promises);
    alert("50 שאלות בסיס נטענו בהצלחה!");
}