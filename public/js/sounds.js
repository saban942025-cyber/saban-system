// public/js/sounds.js

export const SabanSounds = {
    // צליל הודעה עדין (Ping) - לשימוש שוטף
    playMessage: () => {
        try {
            const audio = new Audio("https://cdn.freesound.org/previews/536/536108_11969407-lq.mp3");
            audio.volume = 0.5;
            audio.play().catch(e => console.warn("Audio autoplay blocked by browser"));
        } catch (e) {}
    },

    // צליל אזעקה חזק (Alert) - לשינויים דחופים/עצירת הזמנה
    playAlert: () => {
        try {
            const audio = new Audio("https://cdn.freesound.org/previews/336/336873_4939798-lq.mp3");
            audio.volume = 1.0;
            audio.play().catch(e => console.warn("Audio autoplay blocked by browser"));
        } catch (e) {}
    }
};
