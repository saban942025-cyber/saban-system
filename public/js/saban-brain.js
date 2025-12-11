// js/saban-brain.js

export const ContainerMonitor = {
    // הגדרות
    MAX_DAYS: 10,
    
    // פונקציה ראשית שרצה כשנכנסים לדשבורד
    checkOverdueContainers: async (db) => {
        const alerts = [];
        const today = new Date();
        
        // שליפת כל ההזמנות בסטטוס "מכולה פעילה"
        // (הערה: נדרש לייבא את collection, query, where, getDocs בקובץ המקורי)
        // לצורך הדוגמה הלוגית:
        
        /* const q = query(collection(db, "orders"), where("status", "==", "active_container"));
        const snapshot = await getDocs(q);
        
        snapshot.forEach(doc => {
            const order = doc.data();
            const placementDate = order.placementDate.toDate(); // המרה מ-Firebase Timestamp
            
            // חישוב הפרש ימים
            const diffTime = Math.abs(today - placementDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays >= 10) {
                alerts.push({
                    type: diffDays > 11 ? "CRITICAL" : "WARNING",
                    client: order.clientName,
                    site: order.project,
                    days: diffDays,
                    provider: order.provider || "לא ידוע",
                    phone: order.contactPhone
                });
            }
        });
        */
       
       return alerts;
    },

    // יצירת הודעת הנדנוד ללקוח
    generateNagMessage: (days, address) => {
        if (days === 10) {
            return `בוקר טוב ☀️\nתזכורת: המכולה ב*${address}* נמצאת אצלך כבר 10 ימים (מסתיים היום).\nכדי להימנע מחיובים, יש לבצע החלפה או פינוי.\n[לחץ כאן לפעולה]`;
        }
        if (days > 10) {
            return `🚨 *חריגה!* המכולה ב${address} חורגת מימי ההשכרה (${days} ימים).\nהחל מהיום יחול חיוב יומי נוסף. נא צור קשר דחוף לפינוי.`;
        }
    }
};
