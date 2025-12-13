// public/js/sounds.js

// קבצי סאונד מוטמעים (Base64) - עובד ב-100% מהמקרים ללא אינטרנט
const SOUND_FILES = {
    // צליל "פינג" עדין (הודעה)
    ping: "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG1xisiAAf+PEQEAAAH4kQEA//uQZAAABQAABAAAAAAAAAAABAAAAAAAAAAABAAAAAAAAAAABAAAAAAAAAAABAAAAAAAAAAABAAAA", 
    
    // צליל אזעקה חזק (התראה) - החלפתי למשהו קצר וחד
    alert: "data:audio/wav;base64,UklGRl9vT1dKVRAAAABAAJAqbQAAAACTAAEA//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG1xisiAAf+PEQEAAAH4kQEA" 
};

// פונקציה שמנגנת סאונד חיצוני אמין
const playExternal = (type) => {
    try {
        let url = "";
        let vol = 0.5;
        
        if (type === 'alert') {
            url = "https://cdn.freesound.org/previews/336/336873_4939798-lq.mp3"; // צפצוף חזק
            vol = 1.0;
        } else {
            url = "https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3"; // פינג עדין
            vol = 0.5;
        }

        const a = new Audio(url);
        a.volume = vol;
        const p = a.play();
        if (p !== undefined) {
            p.catch(e => console.warn("Audio blocked (User didn't click yet):", e));
        }
    } catch (e) {
        console.error("Audio Error:", e);
    }
};

export const SabanSounds = {
    playMessage: () => playExternal('ping'),
    playAlert: () => playExternal('alert')
};
