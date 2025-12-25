// public/js/sounds.js

const SabanSounds = {
    // מאגר צלילים (לינקים יציבים)
    sources: {
        message: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.m4a", // צליל הודעה עדין
        alert: "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.m4a"   // צליל התראה דחוף
    },

    cache: {},
    isUnlocked: false,

    // פונקציית אתחול - חובה לקרוא לה בתחילת הדף!
    init: () => {
        // מאזין ללחיצה הראשונה של המשתמש כדי לשחרר את הסאונד
        const unlock = () => {
            if (SabanSounds.isUnlocked) return;
            
            // מנגן צליל "ריק" כדי לפתוח את הערוץ
            const audio = new Audio(SabanSounds.sources.message);
            audio.volume = 0;
            audio.play().then(() => {
                SabanSounds.isUnlocked = true;
                console.log("🔊 מערכת הסאונד שוחררה בהצלחה!");
                // הסרת המאזין כדי לא להכביד
                document.removeEventListener('click', unlock);
                document.removeEventListener('keydown', unlock);
            }).catch(e => console.log("עדיין חסום, נסה שוב בלחיצה הבאה"));
        };

        document.addEventListener('click', unlock);
        document.addEventListener('keydown', unlock);
    },

    play: (type = 'message') => {
        const url = SabanSounds.sources[type] || SabanSounds.sources.message;
        
        // יצירה או שליפה מהזיכרון
        if (!SabanSounds.cache[url]) {
            SabanSounds.cache[url] = new Audio(url);
        }
        
        const audio = SabanSounds.cache[url];
        audio.currentTime = 0; // איפוס להתחלה
        audio.volume = 0.8;

        const p = audio.play();
        if (p !== undefined) {
            p.catch(error => {
                console.warn("⚠️ סאונד חסום. המשתמש חייב ללחוץ על המסך פעם אחת.");
            });
        }
    }
};

export { SabanSounds };
