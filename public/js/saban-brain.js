// public/js/saban-brain.js

export const SabanLogic = {
    // --- חלק א': ניתוח עגלה ומלכודות ---
    analyzeCart: (cartItems) => {
        let analysis = {
            missingServices: [],
            isValid: true,
            totalPrice: 0,
            blockReason: null
        };

        let hasRemoteDeliveryItem = false; // מק"ט 18161
        let deliveryCharge = 0;
        let hasHeavyItems = false;
        let hasCraneService = false;

        cartItems.forEach(item => {
            analysis.totalPrice += (item.price * item.qty);

            if (item.id === "18161") hasRemoteDeliveryItem = true;
            if (item.id === "manual_delivery" || item.type === "delivery") deliveryCharge += (item.price * item.qty);
            
            // בדיקת כבדים (לוגיקה חכמה)
            if (item.logistics && (item.logistics.weight > 25 || item.logistics.requires_crane)) hasHeavyItems = true;
            if (item.id === "service_crane") hasCraneService = true;
        });

        // חוק 1: הובלה באפס שקל
        if (hasRemoteDeliveryItem && deliveryCharge === 0) {
            analysis.isValid = false;
            analysis.blockReason = "GHOST_DELIVERY";
            analysis.missingServices.push({
                msg: "🚨 עצור! הוספת 'הובלה לא אזורית' (18161) במחיר 0, אך לא חייבת הובלה בכסף. חובה להוסיף חיוב ידני!",
                fixId: "manual_delivery"
            });
        }

        // חוק 2: פריט כבד ללא מנוף
        else if (hasHeavyItems && !hasCraneService) {
            // הערה: כאן זה יכול להיות אזהרה בלבד או חסימה, תלוי בקשיחות
            analysis.missingServices.push({
                msg: "⚠️ שים לב: יש פריטים כבדים בהזמנה ללא חיוב מנוף. הנהג לא יפרוק ידנית.",
                fixId: "service_crane"
            });
        }

        return analysis;
    },

    // --- חלק ב': המחשבון הלוגיסטי (היה חסר) ---
    branches: [
        { id: 'harash', name: 'סניף החרש (ראשי)', lat: 32.1462, lng: 34.8951 },
        { id: 'talmid', name: 'סניף התלמיד', lat: 32.1554, lng: 34.8872 }
    ],

    drivers: {
        hachmat: { name: "חכמת", startShift: "06:30", base: "harash" },
        ali: { name: "עלי", startShift: "06:00", base: "talmid" }
    },

    // חישוב מרחק אווירי (Haversine Formula)
    calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1); // מרחק בק"מ
    },

    // מציאת הסניף הקרוב ביותר
    getBestBranch: (targetLat, targetLng) => {
        let best = null;
        let min = Infinity;
        SabanLogic.branches.forEach(b => {
            const d = SabanLogic.calculateDistance(b.lat, b.lng, targetLat, targetLng);
            if (d < min) { min = d; best = { ...b, dist: d }; }
        });
        return best;
    },

    // חישוב זמנים (כולל פקקים ופריקה)
    calculateETA: (distKm) => {
        const speed = 35; // קמ"ש ממוצע למשאית
        const trafficFactor = 1.2; 
        const handlingTime = 30; // דקות פריקה/העמסה
        
        const driveTime = (distKm / speed) * 60 * trafficFactor;
        const totalMinutes = Math.round(driveTime + handlingTime);
        
        const now = new Date();
        const arrival = new Date(now.getTime() + totalMinutes * 60000);
        
        return {
            minutes: totalMinutes,
            time: arrival.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
        };
    }
};
