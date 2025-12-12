// server.js
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// --- מפתחות סודיים (בשרת זה בטוח) ---
const ONE_SIGNAL_APP_ID = "acc8a2bc-d54e-4261-b3d2-cc5c5f7b39d3";
const ONE_SIGNAL_API_KEY = "syyhlq4pzu7reurjs7lqgtb3g"; 

app.use(express.json());
app.use(cors()); // מאפשר גישה
app.use(express.static('public')); // מגיש את קבצי האתר (HTML/JS)

// --- נקודת קצה לשליחת התראות (הגשר) ---
app.post('/api/send-notification', async (req, res) => {
    const { targetUid, title, message } = req.body;

    if (!targetUid || !title || !message) {
        return res.status(400).json({ error: "חסרים נתונים" });
    }

    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${ONE_SIGNAL_API_KEY}`
            },
            body: JSON.stringify({
                app_id: ONE_SIGNAL_APP_ID,
                include_aliases: { "external_id": [targetUid] },
                target_channel: "push",
                contents: { en: message, he: message },
                headings: { en: title, he: title },
                buttons: [{id: "open_app", text: "פתח אפליקציה"}]
            })
        });

        const data = await response.json();
        console.log("Push sent:", data);
        res.json(data);

    } catch (error) {
        console.error("Error sending push:", error);
        res.status(500).json({ error: "שגיאת שרת בשליחת ההתראה" });
    }
});

// הפנייה ל-index.html בכל בקשה אחרת
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 SabanOS Server running on port ${port}`);
});
