import { firebaseConfig, API_KEYS } from './config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// אתחול Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- לוגיקה עסקית ---

// 1. פונקציית חיפוש ראשית (הלב של המערכת)
export async function searchAndProcessProduct(term) {
    console.log(`Searching for: ${term}`);
    
    // שלב א': בדיקה במלאי המקומי
    const inventoryRef = collection(db, "inventory");
    const q = query(inventoryRef, where("keywords", "array-contains", term.toLowerCase()));
    
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            console.log("Product found in local inventory!");
            const products = [];
            querySnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data(), source: 'local' });
            });
            return products; // החזרת מוצרים מקומיים
        }
    } catch (e) {
        console.error("Local DB Error:", e);
    }

    // שלב ב': אם לא נמצא, חיפוש חיצוני + AI
    console.log("Not found locally. Searching Web...");
    return await fetchFromWebAndAI(term);
}

// 2. חיפוש חיצוני ועיבוד AI
async function fetchFromWebAndAI(term) {
    // הערה: שימוש ב-SerpApi מצד הלקוח עשוי לדרוש Proxy בגלל CORS.
    // לצורך יציבות הפתרון כרגע, אנחנו נשתמש ב-Gemini ישירות כדי לייצר מידע,
    // כיוון ש-Google Generative AI מאפשר גישה נוחה יותר.
    
    const prompt = `
    You are an expert in construction materials for "Saban Building Materials".
    User is asking for: "${term}".
    
    Please generate a detailed JSON object for this product (in Hebrew) with the following specific fields:
    - name: Product Name
    - description: Short description
    - uses: List of uses
    - technical_specs: coverage, drying_time, sizes
    - standard: ISO or Israeli standard if known
    - price_estimate: Estimated price range in ILS
    
    Output ONLY raw JSON. No markdown.
    `;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEYS.gemini}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const rawText = data.candidates[0].content.parts[0].text;
        
        // ניקוי ה-JSON (לפעמים המודל מוסיף ```json)
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const productData = JSON.parse(cleanJson);
        
        // סימון שהמוצר הגיע מ-AI
        productData.source = 'ai_generated';
        productData.keywords = [term.toLowerCase()]; // להוסיף לחיפוש עתידי
        
        return [productData];

    } catch (error) {
        console.error("AI Generation failed:", error);
        return [];
    }
}

// 3. הוספת מוצר חדש למלאי (שמירת תוצאת ה-AI)
export async function saveProductToInventory(product) {
    try {
        // הסרת שדה ה-ID וה-Source לפני שמירה
        const { id, source, ...dataToSave } = product;
        const docRef = await addDoc(collection(db, "inventory"), dataToSave);
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
}
