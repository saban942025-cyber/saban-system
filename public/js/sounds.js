// public/js/sounds.js

// יצירת הקשר סאונד (Audio Context)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const SabanSounds = {
    // פונקציית אתחול - נקראת בלחיצה הראשונה על כפתור הרמקול
    init: () => {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                console.log("🔊 AudioContext שוחרר בהצלחה!");
            });
        }
    },

    // פונקציה שמייצרת צליל דיגיטלי (ללא קובץ)
    beep: () => {
        try {
            // אם הסאונד חסום - נסה לשחרר אותו שוב
            if (audioCtx.state === 'suspended') audioCtx.resume();

            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine'; // צליל עגול ונעים
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // תדר התחלה
            oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1); // אפקט ירידה (כמו טיפה)

            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio Error:", e);
        }
    },

    // הפונקציה שהדף קורא לה
    playMessage: () => SabanSounds.beep()
};
