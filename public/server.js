// server.js - השרת המתווך
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// המפתחות הסודיים יושבים כאן (בטוח בשרת)
const ONE_SIGNAL_APP_ID = "acc8a2bc-d54e-4261-b3d2-cc5c5f7b39d3";
const ONE_SIGNAL_API_KEY = "syyhlq4pzu7reurjs7lqgtb3g"; 

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // מגיש את ה-HTML/JS

// נקודת הקצה לשליחת התראות
app.post('/api/send-notification', async (req, res) => {
    const { targetUid, title, message } = req.body;

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
                headings: { en: title, he: title }
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ניתוב ברירת מחדל
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
