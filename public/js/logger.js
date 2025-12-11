// public/js/logger.js

// פונקציית לוגים פשוטה למערכת - מונעת קריסה של הדפים
export const logger = {
    info: (msg, data = "") => {
        console.log(`[SabanOS Info]: ${msg}`, data);
    },
    error: (msg, error = "") => {
        console.error(`[SabanOS Error]: ${msg}`, error);
    },
    warn: (msg) => {
        console.warn(`[SabanOS Warning]: ${msg}`);
    }
};

// ייצוא דיפולטיבי למקרה של ייבוא ישיר
export default logger;
