// public/js/sounds.js

export const SabanSounds = {
    // צליל הודעה (Ping)
    playMessage: () => {
        // צליל 'בועה' קצר
        const audio = new Audio("https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3");
        audio.volume = 0.5;
        handlePlay(audio);
    },

    // צליל אזעקה (Alert) - לשינויים דחופים
    playAlert: () => {
        // צליל התראה כפול
        const audio = new Audio("https://cdn.freesound.org/previews/336/336873_4939798-lq.mp3");
        audio.volume = 1.0;
        handlePlay(audio);
    }
};

function handlePlay(audio) {
    const promise = audio.play();
    if (promise !== undefined) {
        promise.then(_ => {
            console.log("🔊 Sound played successfully");
        }).catch(error => {
            console.warn("🔇 Sound blocked! Interaction required.", error);
        });
    }
}
