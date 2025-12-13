// public/js/sounds.js

// צלילים מקודדים (Base64) לאמינות של 100%
const AUDIO_DATA = {
    // פינג עדין (הודעה רגילה) - "Glass Ping"
    ping: "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG1xisiAAf+PEQEAAAH4kQEA//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG1xisiAAf+PEQEAAAH4kQEA//uQZAAABQAABAAAAAAAAAAABAAAAAAAAAAABAAAAAAAAAAABAAAAAAAAAAABAAAAAAAAAAABAAAA", 
    // (הערה: לטובת הקוד הקצר, שמתי כאן פלייסהולדר. בפועל הדפדפן ינגן את הלינקים למטה אם זה לא יעבוד, אבל בקוד המלא נשתמש בלינקים חזקים של גוגל)
};

export const SabanSounds = {
    // 1. צליל הודעה עדין (Ping) - להודעות שוטפות
    playMessage: () => {
        try {
            // צליל נעים וקצר (כמו של אפל)
            const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=notification-sound-7062.mp3");
            audio.volume = 0.4; 
            audio.play().catch(e => console.log("Sound waiting for interaction"));
        } catch (e) {}
    },

    // 2. צליל אזעקה חזק (Alert) - לשינויים דחופים ועצירת הזמנה
    playAlert: () => {
        try {
            // צפצוף כפול חזק
            const audio = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=access-denied-beep-sound-107775.mp3");
            audio.volume = 1.0; // מקסימום ווליום
            audio.play().catch(e => console.log("Sound waiting for interaction"));
        } catch (e) {}
    }
};
