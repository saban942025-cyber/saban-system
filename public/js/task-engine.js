// public/js/task-engine.js
import { getFirestore, collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { SabanPush } from './notifications.js';

export const TaskEngine = {
    
    // יצירת משימה חדשה
    createTask: async (db, taskData) => {
        /*
          taskData structure:
          {
            title: "בדיקת תעודה",
            desc: "תבדוק שלא חסר מלט",
            fromUid: "harel_uid",
            toUid: "rami_uid", // למי המשימה
            priority: "high", // low, medium, high, critical
            dueDate: timestamp,
            nagging: 3, // רמת נדנוד (1-5)
            attachments: [{type: 'pdf', url: 'drive_link...'}],
            status: 'open'
          }
        */
        
        try {
            const ref = await addDoc(collection(db, "tasks"), {
                ...taskData,
                createdAt: serverTimestamp(),
                history: [{ user: taskData.fromUid, action: "created", time: new Date() }]
            });

            // שליחת התראה למקבל המשימה
            await SabanPush.send(taskData.toUid, "משימה חדשה 📋", `הראל הטיל עליך משימה: ${taskData.title}`);
            
            return ref.id;
        } catch (e) { console.error("Task Create Error", e); }
    },

    // עדכון סטטוס (סיום/עיכוב)
    updateStatus: async (db, taskId, status, userId, note = "") => {
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, {
            status: status,
            lastUpdate: serverTimestamp()
        });
        
        // לוגיקה של "נדנוד" - אם המשימה לא הושלמה בזמן
        if (status === 'delayed') {
            await SabanPush.send(userId, "תזכורת עצבנית ⏰", "הראל מחכה לתשובה על המשימה!");
        }
    },

    // הדמיית העלאת קובץ (במערכת אמיתית זה יתחבר ל-Google Drive API)
    uploadFileToDrive: async (file) => {
        // סימולציה: במציאות נשתמש ב-Make.com כדי לשלוח את הקובץ לדרייב ולהחזיר לינק
        console.log("Uploading to Virtual Drive...", file.name);
        
        // מחזיר לינק דמו (כאילו הקובץ עלה לדרייב)
        return {
            name: file.name,
            type: file.type.includes('pdf') ? 'pdf' : 'image',
            url: URL.createObjectURL(file), // זמני לדפדפן (בפרודקשן זה יהיה לינק דרייב)
            driveId: "12345_fake_drive_id"
        };
    }
};
