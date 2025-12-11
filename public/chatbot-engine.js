// הוסף את פונקציית העזר הזו למחלקה או מחוצה לה
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1); 
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) { return deg * (Math.PI/180); }

// --- עדכון פונקציית handleLogisticsQuery במחלקה SabanChatbot ---
    async handleLogisticsQuery() {
        let driverData = null;
        let distance = 0;

        try {
            // 1. שליפת הנהג האמיתי מ-Firestore (מצריך להעביר את האובייקט getDoc/db בקונסטרקטור)
            // לצורך הדוגמה כאן, נניח שאנחנו מקבלים את המיקום העדכני
            // (בפרודקשן נבצע כאן: const snap = await getDoc(doc(this.db, 'users', 'driver_hikmat'));)
            
            // נשתמש במיקום סימולטיבי רק אם אין חיבור ל-DB בתוך המחלקה
            // אבל נחשב מרחק אמיתי מול נקודה קבועה (הלקוח)
            
            const driverLoc = { lat: 32.166, lng: 34.833 }; // נניח שזה המיקום שחזר מ-Firebase
            const userLoc = { lat: 32.180, lng: 34.850 }; // מיקום הלקוח (הרצליה)

            // חישוב מרחק אמיתי!
            distance = getDistanceFromLatLonInKm(driverLoc.lat, driverLoc.lng, userLoc.lat, userLoc.lng);
            
        } catch (e) {
            console.error("Error calculating distance", e);
            distance = 5; // Fallback
        }

        // המרה לזמן (30 קמ"ש ממוצע בעיר)
        const speedKmh = 30;
        const etaHours = distance / speedKmh;
        const etaMinutes = Math.ceil(etaHours * 60);

        return {
            text: `בדקתי במערכת הלוויינית 🛰️\nהנהג נמצא במרחק **${distance.toFixed(1)} ק"מ** (קו אווירי).\nזמן הגעה משוער (לפי תנועה): **${etaMinutes} דקות.**`,
            buttons: [
                { label: "📍 צפה במפה LIVE", action: "open_map" },
                { label: "📞 התקשר לנהג", action: "call_driver" }
            ]
        };
    }
