// public/js/sounds.js

const SabanSounds = {
    // מאגר לינקים יציבים
    sources: {
        message: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.m4a",
        alert: "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.m4a"
    },

    cache: {},
    isUnlocked: false,

    // 1. אתחול: שחרור חסימת דפדפן (חובה לקרוא לזה בטעינת הדף)
    init: () => {
        const unlock = () => {
            if (SabanSounds.isUnlocked) return;
            
            // מנגן צליל ריק כדי לפתוח את ה-AudioContext
            const audio = new Audio(SabanSounds.sources.message);
            audio.volume = 0;
            
            audio.play().then(() => {
                SabanSounds.isUnlocked = true;
                console.log("🔊 סאונד שוחרר בהצלחה");
                // ניקוי מאזינים כדי לא להכביד
                document.removeEventListener('click', unlock);
                document.removeEventListener('keydown', unlock);
                document.removeEventListener('touchstart', unlock);
            }).catch(e => {
                // התעלמות שקטה אם עדיין חסום
            });
        };

        // מאזין לכל סוג של אינטראקציה
        document.addEventListener('click', unlock);
        document.addEventListener('keydown', unlock);
        document.addEventListener('touchstart', unlock);
    },

    // 2. הפונקציה הראשית לניגון
    play: (type) => {
        const url = SabanSounds.sources[type] || SabanSounds.sources.message;
        
        // יצירה חדשה או שליפה מהזיכרון
        if (!SabanSounds.cache[url]) {
            SabanSounds.cache[url] = new Audio(url);
        }
        
        const audio = SabanSounds.cache[url];
        audio.currentTime = 0;
        audio.volume = 0.8;

        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // לוג שקט יותר כדי לא להפציץ את הקונסול
                if(!SabanSounds.isUnlocked) {
                    console.warn("🔇 סאונד מושתק ע''י הדפדפן - ממתין ללחיצה ראשונה של המשתמש.");
                } else {
                    console.error("Audio Error:", error);
                }
            });
        }
    },

    // --- התיקון הקריטי: חשיפת הפונקציות החסרות ---
    playMessage: () => SabanSounds.play('message'),
    playAlert: () => SabanSounds.play('alert')
};

export { SabanSounds };
