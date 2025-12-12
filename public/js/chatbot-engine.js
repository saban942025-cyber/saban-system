// public/js/chatbot-engine.js
import { SabanPush } from './notifications.js';
import { TaskEngine } from './task-engine.js';

export class SabanChatbot {
    constructor(db, userContext) {
        this.db = db;
        this.user = userContext; 
        this.state = null; // זיכרון לשיחה (מחכה לתשובה)
        this.tempData = {}; // שמירת נתונים זמניים (כמו סוג משאית)
    }

    async ask(question) {
        const cleanQ = question.trim();

        // --- 1. מנהל סניף (איציק/נתנאל) - תהליכים פנימיים ---
        if (this.user.role === 'manager' || this.user.role === 'branch_manager' || this.user.role === 'admin') {
            
            // תהליך: העברה בין סניפים
            if (cleanQ.includes("העברה") || cleanQ === "transfer_flow") {
                this.state = "waiting_transfer_num";
                return { 
                    text: `היי ${this.user.name}, לפתיחת משימת העברה לסידור – <b>חובה להקליד מספר תעודת העברה</b> (מהמערכת).`,
                    type: "system"
                };
            }

            // שלב ב': בדיקת מספר העברה (מחסום)
            if (this.state === "waiting_transfer_num") {
                if (/^\d+$/.test(cleanQ)) { // בדיקה שזה רק מספרים
                    this.state = null;
                    // יצירת המשימה ביומן
                    await TaskEngine.createTask(this.db, {
                        title: `🚛 העברה מס' ${cleanQ}`,
                        desc: `בקשה מ${this.user.name} (${this.user.branch})`,
                        toUid: "ops_team", // לצוות סידור
                        fromUid: this.user.id,
                        priority: "medium",
                        status: "open",
                        type: "transfer"
                    });
                    
                    return { 
                        text: `✅ משימה נקלטה והועברה לסידור!<br>מספר העברה: <b>${cleanQ}</b>.<br>תקבל עדכון ברגע שישובץ נהג.`,
                        action: "success_anim"
                    };
                } else {
                    return { text: "⚠️ שגיאה: נא להקליד ספרות בלבד (מספר תעודה). נסה שוב." };
                }
            }

            // תהליך: הזמנת נהג לפי שעות
            if (cleanQ.includes("נהג") || cleanQ === "driver_flow") {
                this.state = "waiting_driver_hours";
                return {
                    text: "הזמנת עבודת נהג (פריקה ידנית/הובלה).<br>כמה שעות נדרשות?",
                    buttons: [
                        { label: "1 שעה", action: "reply", payload: "1" },
                        { label: "שעתיים", action: "reply", payload: "2" },
                        { label: "חצי יום (4)", action: "reply", payload: "4" }
                    ]
                };
            }

            if (this.state === "waiting_driver_hours") {
                this.state = null;
                const hours = cleanQ;
                await TaskEngine.createTask(this.db, {
                    title: `👷‍♂️ דרישת נהג - ${hours} שעות`,
                    desc: `עבור סניף ${this.user.branch || 'החרש'}. דורש פריקה ידנית.`,
                    toUid: "ops_team",
                    fromUid: this.user.id,
                    priority: "high",
                    status: "open"
                });
                return { text: `קיבלתי. ביקשת נהג ל-<b>${hours} שעות</b>.<br>הבקשה נשלחה לראמי לשיבוץ בסידור. ✔️` };
            }
        }

        // --- 2. לקוח - תהליכים חיצוניים ---
        
        // שליחת מיקום
        if (cleanQ.startsWith("LOCATION:")) {
            const coords = cleanQ.split(":")[1];
            return { 
                text: `📍 המיקום נקלט בהצלחה!<br><a href='https://waze.com/ul?ll=${coords}&navigate=yes' target='_blank' class='text-blue-600 font-bold underline'>פתח ב-Waze לבדיקה</a><br>הנהג יקבל את הלינק הזה ישירות.`,
                type: "location_received"
            };
        }

        // זיהוי מסמך
        if (cleanQ.startsWith("FILE:")) {
            const fileName = cleanQ.split("|")[1];
            return {
                text: `📄 המסמך <b>"${fileName}"</b> צורף לתיק ההזמנה.<br>מתועד בתאריך: ${new Date().toLocaleDateString()}`,
                type: "file_received"
            };
        }

        // --- ברירת מחדל ---
        return { 
            text: "ממתין לפקודה...", 
            action: "menu" 
        };
    }
}
