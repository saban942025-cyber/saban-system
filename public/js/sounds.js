// public/js/sounds.js

const SabanSounds = {
    // הגדרת מקורות הסאונד (לינקים קצרים ומהירים)
    sources: {
        // צליל "טיפה" נעים להודעה רגילה
        ping: "https://cdn.jsdelivr.net/gh/interactive-examples/media/audio/t-rex-roar.mp3", // סתם, החלפתי למשהו עדין למטה
        // שימוש בשרת CDN אמין של Google/FreeSound לצלילים קצרים
        message: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.m4a",
        alert: "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.m4a"
    },

    // משתנה לשמירת האובייקט כדי לא לטעון כל פעם מחדש
    audioCache: {},

    // פונקציית הניגון הראשית
    play: (type) => {
        try {
            const url = type === 'alert' ? SabanSounds.sources.alert : SabanSounds.sources.message;
            
            // בדיקה אם כבר טענו את הסאונד הזה (חוסך זיכרון)
            if (!SabanSounds.audioCache[type]) {
                SabanSounds.audioCache[type] = new Audio(url);
            }

            const audio = SabanSounds.audioCache[type];
            audio.volume = 0.8; // עוצמה נעימה
            audio.currentTime = 0; // התחלה מהתחלה (למקרה של הודעות רצופות)

            // ניסיון ניגון (פותר את הבעיה של Audio Blocked)
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // אם הדפדפן חוסם (כי המשתמש עוד לא לחץ על כלום בדף)
                    console.log("🔊 ממתין לאינטראקציה ראשונה של המשתמש כדי לנגן סאונד.");
                });
            }
        } catch (e) {
            console.error("שגיאת סאונד:", e);
        }
    },

    // קיצורי דרך נוחים לקריאה מהקבצים האחרים
    playMessage: () => SabanSounds.play('message'),
    playAlert: () => SabanSounds.play('alert')
};

// ייצוא המודול
export { SabanSounds };
