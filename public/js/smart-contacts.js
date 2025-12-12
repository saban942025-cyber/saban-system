// public/js/smart-contacts.js

/**
 * SabanOS Smart Contacts Module
 * מאפשר הצגת כרטיסי ביקור, תיוג בצ'אט, ופעולות מהירות.
 */

export const SmartContacts = {
    
    // 1. יצירת כרטיס קשר (HTML String)
    createCardHTML: (user) => {
        const isStaff = user.type === 'staff';
        const roleTitle = isStaff ? user.description : `${(user.projects || []).length} פרויקטים פעילים`;
        const location = user.branch || (user.projects && user.projects[0]?.name) || 'לא צוין מיקום';

        return `
        <div class="contact-card bg-white rounded-xl shadow-2xl border border-gray-100 w-72 overflow-hidden font-sans text-right" style="position:absolute; z-index:9999; display:none;">
            <div class="h-16 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div class="px-4 pb-4 -mt-8">
                <img src="${user.avatar}" class="w-16 h-16 rounded-full border-4 border-white shadow-md bg-white">
                <div class="mt-2">
                    <h3 class="font-bold text-lg text-gray-800 flex items-center gap-2">
                        ${user.name} 
                        ${isStaff ? '<i class="fas fa-check-circle text-blue-500 text-xs"></i>' : ''}
                    </h3>
                    <p class="text-xs text-gray-500 font-bold uppercase tracking-wide">${user.role}</p>
                    <p class="text-xs text-gray-400 mt-1"><i class="fas fa-map-marker-alt"></i> ${location}</p>
                </div>
                
                <div class="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                    ${roleTitle}
                </div>

                <div class="grid grid-cols-4 gap-2 mt-4">
                    <a href="tel:${user.phone}" class="flex flex-col items-center gap-1 text-gray-500 hover:text-green-600 transition">
                        <div class="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center"><i class="fas fa-phone"></i></div>
                        <span class="text-[9px] font-bold">חייג</span>
                    </a>
                    <button onclick="openPrivateChat('${user.uid}')" class="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600 transition">
                        <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><i class="fas fa-comment-alt"></i></div>
                        <span class="text-[9px] font-bold">צ'אט</span>
                    </button>
                    <a href="mailto:${user.email}" class="flex flex-col items-center gap-1 text-gray-500 hover:text-orange-600 transition">
                        <div class="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center"><i class="fas fa-envelope"></i></div>
                        <span class="text-[9px] font-bold">מייל</span>
                    </a>
                    <button class="flex flex-col items-center gap-1 text-gray-500 hover:text-purple-600 transition">
                        <div class="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center"><i class="fas fa-user-plus"></i></div>
                        <span class="text-[9px] font-bold">שמור</span>
                    </button>
                </div>
            </div>
        </div>
        `;
    },

    // 2. הצמדת אירועים (Hover Logic)
    attachHoverListeners: (containerElement, usersDb) => {
        // מחפש אלמנטים עם data-uid או תגיות @
        // (יש להוסיף את הלוגיקה בדף שמייבא את זה)
    }
};
