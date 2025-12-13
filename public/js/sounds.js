// public/js/sounds.js

export const SabanSounds = {
    // צליל הודעה עדין (Ping)
    playMessage: () => {
        const audio = new Audio("https://cdn.freesound.org/previews/536/536108_11969407-lq.mp3");
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio blocked"));
    },

    // צליל אזעקה חזק לשינויים דחופים (Alert)
    playAlert: () => {
        const audio = new Audio("https://cdn.freesound.org/previews/336/336873_4939798-lq.mp3");
        audio.volume = 1.0;
        audio.play().catch(e => console.log("Audio blocked"));
    }
};
