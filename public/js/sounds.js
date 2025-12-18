// public/js/sounds.js

// קבצי סאונד מוטמעים (גיבוי למקרה שאין אינטרנט)
const SOUND_FILES = {
    ping: "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG1xisiAAf+PEQEAAAH4kQEA//uQZAAABQAABAAAAAAAAAAABAAAAAAAAAAABAAAAAAAAAAABAAAAAAAAAAABAAAAAAAAAAABAAAA", 
    alert: "data:audio/wav;base64,UklGRl9vT1dKVRAAAABAAJAqbQAAAACTAAEA//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG1xisiAAf+PEQEAAAH4kQEA" 
};

// פונקציה שמנגנת סאונד חיצוני אמין
const playExternal = (type) => {
    try {
        let url = "";
        let vol = 0.5;
        
        if (type === 'alert') {
            // === צליל חירום / אזעקה (נשאר אותו דבר - חזק) ===
            // Siren / Emergency Tone
            url = "https://assets.mixkit.co/active_storage/sfx/933/933-preview.m4a"; 
            vol = 1.0;
        } else {
            // === החידוש: צליל הודעה דיגיטלי (Message Alert) ===
            // Digital Message Notification Tone
            url = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.m4a"; 
            vol = 0.7; // ווליום מותאם להודעה
        }

        const a = new Audio(url);
        a.volume = vol;
        
        // ניסיון ניגון עם טיפול בשגיאות (חסימות דפדפן)
        const p = a.play();
        if (p !== undefined) {
            p.catch(e => console.warn("Audio blocked (User didn't click yet):", e));
        }
    } catch (e) {
        console.error("Audio Error:", e);
    }
};

export const SabanSounds = {
    playMessage: () => playExternal('ping'), // הודעה רגילה
    playAlert: () => playExternal('alert')   // צופר חירום
};
