// public/js/smart-contacts.js

export const SmartContacts = {
    
    // פתיחת כרטיס קשר צף
    show: (event, user) => {
        // הסרת כרטיסים קיימים
        const existing = document.getElementById('contact-card-popup');
        if(existing) existing.remove();

        // יצירת אלמנט הכרטיס
        const card = document.createElement('div');
        card.id = 'contact-card-popup';
        card.className = "fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-100 w-72 overflow-hidden font-sans text-right fade-in";
        
        // מיקום (ליד העכבר)
        const rect = event.target.getBoundingClientRect();
        let top = rect.bottom + 10;
        let left = rect.left;
        
        // תיקון מיקום אם יוצא מהמסך
        if (left + 288 > window.innerWidth) left = window.innerWidth - 300; 
        if (top + 300 > window.innerHeight) top = rect.top - 300;

        card.style.top = `${top}px`;
        card.style.left = `${left}px`;

        // זיהוי תפקיד וצבעים
        const isStaff = user.type === 'staff';
        const roleColor = isStaff ? 'from-blue-600 to-indigo-600' : 'from-green-600 to-emerald-600';
        const icon = isStaff ? '<i class="fas fa-id-badge"></i>' : '<i class="fas fa-user-tag"></i>';

        // ה-HTML של הכרטיס
        card.innerHTML = `
            <div class="h-20 bg-gradient-to-r ${roleColor} relative">
                <button onclick="this.closest('#contact-card-popup').remove()" class="absolute top-2 left-2 text-white/80 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="px-5 pb-5 -mt-10">
                <img src="${user.avatar || 'https://via.placeholder.com/64'}" class="w-20 h-20 rounded-full border-4 border-white shadow-md bg-white object-cover">
                <div class="mt-3">
                    <h3 class="font-bold text-lg text-gray-800 flex items-center gap-2">
                        ${user.name} 
                        ${isStaff ? '<i class="fas fa-check-circle text-blue-500 text-xs" title="צוות מאומת"></i>' : ''}
                    </h3>
                    <p class="text-xs text-gray-500 font-bold uppercase tracking-wide flex items-center gap-1">${icon} ${user.roleName || user.role}</p>
                    <p class="text-xs text-gray-400 mt-1"><i class="fas fa-map-marker-alt"></i> ${user.branch || 'לא צוין מיקום'}</p>
                </div>
                
                <div class="mt-3 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                    ${user.description || 'אין תיאור זמין.'}
                </div>

                <div class="grid grid-cols-4 gap-2 mt-5 border-t pt-4">
                    <a href="tel:${user.phone}" class="flex flex-col items-center gap-1 text-gray-500 hover:text-green-600 transition group">
                        <div class="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition"><i class="fas fa-phone"></i></div>
                        <span class="text-[10px] font-bold">חייג</span>
                    </a>
                    <a href="https://wa.me/972${user.phone.replace(/^0/, '')}" target="_blank" class="flex flex-col items-center gap-1 text-gray-500 hover:text-green-500 transition group">
                        <div class="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition"><i class="fab fa-whatsapp"></i></div>
                        <span class="text-[10px] font-bold">ווצאף</span>
                    </a>
                    <a href="mailto:${user.email}" class="flex flex-col items-center gap-1 text-gray-500 hover:text-orange-600 transition group">
                        <div class="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition"><i class="fas fa-envelope"></i></div>
                        <span class="text-[10px] font-bold">מייל</span>
                    </a>
                    <button id="btn-open-private-chat" class="flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600 transition group">
                        <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition"><i class="fas fa-comment-dots"></i></div>
                        <span class="text-[10px] font-bold">צ'אט</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(card);

        // חיבור אירוע לחיצה לכפתור הצ'אט
        document.getElementById('btn-open-private-chat').onclick = () => {
            if (typeof window.openChat === 'function') {
                // אם אנחנו בחמ"ל - פתח את הצ'אט
                window.openChat(user.uid || user.id, user.name, 'private', user.avatar);
                card.remove();
            } else {
                // אם אנחנו באפליקציה או מקום אחר - התראה (או ניתוב אחר)
                alert("מעבר לצ'אט פרטי זמין רק בחמ\"ל.");
            }
        };
        
        // סגירה בלחיצה בחוץ
        setTimeout(() => {
            document.addEventListener('click', function close(e) {
                if(!card.contains(e.target) && e.target !== event.target) {
                    card.remove();
                    document.removeEventListener('click', close);
                }
            });
        }, 100);
    }
};
