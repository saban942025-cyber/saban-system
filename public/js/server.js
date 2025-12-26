const express = require('express');
const multer = require('multer'); // לטיפול בקבצים מצורפים
const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');

// 1. אתחול Firebase (חובה להוריד מפתח שירות - Service Account Key)
// יש לשמור את הקובץ 'serviceAccountKey.json' באותה תיקייה
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "saban94-eb5f0.firebasestorage.app" // שם הבאקט שלך
});

const db = admin.firestore();
const bucket = getStorage().bucket();
const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // שומר קבצים בזיכרון זמני לעיבוד

// הגדרה לשרת קבצים סטטיים (כדי שהאפליקציות יעבדו)
app.use(express.static('public'));

// --- ה-Webhook הקסום ---
// כתובת זו תקבל את המייל (SendGrid Inbound Parse שולח לכאן)
app.post('/webhook/email', upload.any(), async (req, res) => {
    try {
        console.log("📩 מייל נכנס חדש!");
        
        // נתונים שמגיעים מה-Webhook (תלוי בספק, בד"כ SendGrid/Mailgun)
        const subject = req.body.subject || "No Subject";
        const files = req.files; // המערך של הקבצים המצורפים

        console.log(`נושא: ${subject}`);

        // 1. חילוץ מספר הזמנה (מחפש תבנית של #מספר או סתם מספר)
        // מניחים שקומקס שולח נושא כמו: "חשבונית להזמנה 10543"
        const orderMatch = subject.match(/(\d{4,})/); // מחפש רצף של 4 ספרות ומעלה
        
        if (!orderMatch) {
            console.log("❌ לא נמצא מספר הזמנה בנושא המייל.");
            return res.status(200).send("No Order ID found, ignored.");
        }

        const orderNum = orderMatch[0]; // המספר שחולץ (למשל "10543")
        console.log(`🔍 זוהה מספר הזמנה: ${orderNum}`);

        // 2. חיפוש ההזמנה ב-Firestore
        // אנחנו מחפשים הזמנה שיש לה שדה 'orderNum' או שה-ID שלה הוא המספר
        // נניח כרגע שה-ID של המסמך הוא לא המספר, אז נבצע שאילתה.
        const ordersSnapshot = await db.collection('orders')
            .where('orderNum', '==', orderNum) // ודא שיש שדה כזה בהזמנות!
            .limit(1)
            .get();

        if (ordersSnapshot.empty) {
            console.log(`❌ הזמנה #${orderNum} לא קיימת במערכת.`);
            // אופציונלי: ליצור מסמך חדש בתיקיית 'מסמכים ללא שיוך'
            return res.status(200).send("Order not found.");
        }

        const orderDoc = ordersSnapshot.docs[0];
        const orderId = orderDoc.id;

        // 3. עיבוד הקובץ (PDF)
        const pdfFile = files.find(f => f.mimetype === 'application/pdf');
        
        if (!pdfFile) {
            console.log("⚠️ לא נמצא קובץ PDF במייל.");
            return res.status(200).send("No PDF attached.");
        }

        // 4. העלאה ל-Storage
        const destination = `documents/orders/${orderId}_${Date.now()}.pdf`;
        const fileUpload = bucket.file(destination);

        await fileUpload.save(pdfFile.buffer, {
            metadata: { contentType: pdfFile.mimetype }
        });

        // הופך את הקובץ לציבורי (כדי שיהיה לינק)
        await fileUpload.makePublic(); 
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;

        console.log(`✅ הקובץ הועלה: ${publicUrl}`);

        // 5. עדכון ההזמנה ב-Firestore (הוספת הלינק והכפתור)
        await db.collection('orders').doc(orderId).update({
            docUrl: publicUrl,      // הלינק למסמך
            docTitle: subject,      // כותרת המסמך
            hasDoc: true,           // דגל להצגת כפתור
            lastUpdate: admin.firestore.FieldValue.serverTimestamp()
        });

        // 6. שליחת התראה לנהג (אופציונלי)
        // כאן אפשר להוסיף לוגיקה ששולחת Notification לנהג "התקבל מסמך!"

        res.status(200).send("Document processed successfully!");

    } catch (error) {
        console.error("Error processing email:", error);
        res.status(500).send("Internal Server Error");
    }
});

// הפעלת השרת
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Saban Server running on port ${PORT}`);
});
