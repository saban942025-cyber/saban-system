// js/saban-brain.js

export const SabanLogic = {
    analyzeCart: (cartItems) => {
        let analysis = {
            missingServices: [],
            isValid: true,
            totalPrice: 0
        };

        // משתנים לבדיקת הובלה
        let hasRemoteDeliveryItem = false; // האם יש מק"ט 18161?
        let deliveryCharge = 0;            // כמה כסף חייבו על הובלה?

        cartItems.forEach(item => {
            // סיכום מחיר
            analysis.totalPrice += (item.price * item.qty);

            // --- גלאי המלכודות ---
            
            // זיהוי מק"ט הובלה לא אזורית (מהתעודה שלך)
            if (item.id === "18161") {
                hasRemoteDeliveryItem = true;
            }
            
            // בדיקה אם זה פריט חיוב הובלה (לפי קטגוריה או שם)
            if (item.name.includes("הובלה") || item.category === "transport") {
                deliveryCharge += (item.price * item.qty);
            }
        });

        // --- חוקי הברזל (The Iron Rules) ---

        // חוק 1: מלכודת "הובלה לא אזורית" (הבעיה של שחר שאול)
        // אם יש שורת "הובלה לא אזורית" (שהיא טכנית) אבל סך החיוב על הובלה הוא 0...
        if (hasRemoteDeliveryItem && deliveryCharge === 0) {
            analysis.missingServices.push({
                type: "GHOST_DELIVERY",
                message: "🚨 עצור! יש שורת 'הובלה לא אזורית' (18161) אבל המחיר הוא 0. חייב להוסיף חיוב הובלה ידני!",
                actionId: "manual_delivery_charge"
            });
            analysis.isValid = false;
        }

        // חוק 2: פריטים כבדים ללא מנוף (כמו שדיברנו קודם)
        // ... (הקוד הקודם נשאר כאן)

        return analysis;
    }
};