// public/js/sounds.js

// יצירת הקשר סאונד (Audio Context)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const SabanSounds = {
    // פונקציה שמייצרת צליל דיגיטלי (ללא קובץ)
    beep: (frequency = 1000, type = 'sine') => {
        try {
            // אם הסאונד במצב "מושהה" (בגלל חסימת דפדפן) - נסה לשחרר אותו
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = type; // 'sine' = צליל עגול ונעים
            oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime); // תדר הצליל

            // יצירת אפקט דעיכה (Fade Out) כדי שיישמע כמו פעמון ולא סתם צפצוף
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.6);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.6); // אורך הצליל
        } catch (e) {
            console.error("Audio Context Error:", e);
        }
    },

    // צליל הודעה רגילה (גבוה ונעים)
    playMessage: () => SabanSounds.beep(850, 'sine'),

    // צליל התראה/חירום (נמוך ומרובע)
    playAlert: () => SabanSounds.beep(400, 'square'),
    
    // פונקציית אתחול - נקראת בלחיצה הראשונה על כפתור הרמקול
    init: () => {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                console.log("🔊 AudioContext Resumed by user gesture");
            });
        }
    }
};
