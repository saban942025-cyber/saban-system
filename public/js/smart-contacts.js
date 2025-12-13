// public/js/smart-contacts.js
export const SmartContacts = {
    show: (anchor, user) => {
        const div = document.createElement('div');
        div.className = "fixed inset-0 bg-black/50 z-50 flex items-center justify-center animation-fade-in";
        div.onclick = (e) => { if(e.target === div) div.remove(); };
        
        div.innerHTML = `
            <div class="bg-white p-6 rounded-2xl w-80 text-center shadow-2xl transform scale-100">
                <img src="${user.avatar || 'https://via.placeholder.com/80'}" class="w-20 h-20 rounded-full mx-auto border-4 border-green-500 mb-4">
                <h2 class="text-xl font-bold">${user.name}</h2>
                <p class="text-gray-500 text-sm mb-4">לקוח VIP | מחובר</p>
                
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div class="bg-gray-50 p-2 rounded">
                        <div class="font-bold text-lg">0</div>
                        <div class="text-xs text-gray-400">הזמנות פתוחות</div>
                    </div>
                    <div class="bg-gray-50 p-2 rounded">
                        <div class="font-bold text-lg">0</div>
                        <div class="text-xs text-gray-400">חוב (₪)</div>
                    </div>
                </div>

                <button onclick="this.parentElement.parentElement.remove()" class="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">סגור</button>
            </div>
        `;
        document.body.appendChild(div);
    }
};
