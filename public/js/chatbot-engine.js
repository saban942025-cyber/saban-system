<script type="module">
        import { initializeApp } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js)";
        import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js)";
        import { SabanChatbot } from './js/chatbot-engine.js';

        // Firebase Config
        const firebaseConfig = { apiKey: "AIzaSyA3qwgBX69Clu7pUdOnOEcfzUVyR7ADrNc", authDomain: "saban94-eb5f0.firebaseapp.com", projectId: "saban94-eb5f0", storageBucket: "saban94-eb5f0.firebasestorage.app", messagingSenderId: "656829273946", appId: "1:656829273946:web:8ebcb440ed280aff014563" };
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // API Key (אותו מפתח שעובד בבוט)
        const GEMINI_KEY = "AIzaSyD9plWwyTESFm24c_OTunf4mFAsAmfrgj0";

        // User Data
        const user = { name: "שחר שאול", phone: "050-0000000", avatar: "[https://ui-avatars.com/api/?name=Shahar+Shaul&background=0D8ABC&color=fff](https://ui-avatars.com/api/?name=Shahar+Shaul&background=0D8ABC&color=fff)" };
        
        // Bot Instance
        const botEngine = new SabanChatbot(db, user);

        // State
        let allProducts = [];
        let cart = [];

        // --- 1. Load Data ---
        async function loadData() {
            try {
                const snap = await getDocs(collection(db, "products"));
                allProducts = snap.docs.map(d => ({id: d.id, ...d.data()}));
                renderCatalog();
            } catch(e) { console.error("Error loading products:", e); }
        }

        // --- 2. Smart Order Logic (התיקון הגדול) ---
        window.processSmartOrder = async () => {
            const text = document.getElementById('smartInput').value;
            if(!text) return alert("הדבק קודם רשימה...");

            const btn = document.getElementById('btnSmart');
            const originalBtnText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מפענח הזמנה...';
            btn.disabled = true;

            // שימוש במודל 1.5 Flash המהיר
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
            
            // הנחיה קשוחה לבוט להחזיר רק JSON נקי
            const prompt = `
            Task: Extract construction products and quantities from this Hebrew text: "${text}".
            Output Requirement: Return ONLY a raw JSON array. Do not use Markdown. Do not say "Here is the JSON".
            Format: [{"name": "Product Name in Hebrew", "qty": Number}]
            If no quantity is specified, assume 1.
            `;

            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                if(!res.ok) throw new Error("Google Error");

                const data = await res.json();
                let rawText = data.candidates[0].content.parts[0].text;

                // --- שלב הניקוי (Cleaning) ---
                // מוחק סימני קוד (```json) ורווחים מיותרים
                let cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
                
                // מנסה להפוך את הטקסט לאובייקט
                const items = JSON.parse(cleanJson);

                if(!Array.isArray(items)) throw new Error("Not an array");

                // הוספה לעגלה
                items.forEach(item => {
                    cart.push({
                        id: 'smart_' + Date.now() + Math.random(),
                        core: { name: item.name + ` (כמות: ${item.qty})`, price: 0 },
                        rich: { image: 'https://cdn-icons-png.flaticon.com/512/1040/1040241.png' } // תמונה גנרית לפריט חכם
                    });
                });

                updateCart(); // עדכון התצוגה בעגלה (פונקציה קיימת)
                
                // מעבר ללשונית עגלה והודעת הצלחה
                alert(`✅ הצלחתי! זיהיתי ${items.length} פריטים והוספתי לעגלה.`);
                document.getElementById('smartInput').value = ''; // ניקוי שדה
                switchView('cart'); // מעבר לעגלה (לוודא שיש לך פונקציה כזו או לשנות לפי הלוגיקה שלך)

            } catch(e) {
                console.error("Smart Order Failed:", e);
                alert("לא הצלחתי להבין את הרשימה.\nנסה לכתוב ברור יותר (למשל: '10 שקי מלט').");
            }
            
            // החזרת הכפתור למצב רגיל
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
        };

        // --- 3. Chat Logic ---
        window.sendMsg = async () => {
            const input = document.getElementById('userIn');
            const txt = input.value;
            if(!txt) return;

            addMessage(txt, 'user');
            input.value = '';

            const loadId = addMessage('<i class="fas fa-circle-notch fa-spin"></i> ...', 'bot');
            const res = await botEngine.ask(txt);
            document.getElementById(loadId).remove();
            
            // Render Bot with Product Scan
            addMessage(res.text, 'bot', true);
        };

        function addMessage(text, type, scan = false) {
            const box = document.getElementById('chatBox');
            const row = document.createElement('div');
            row.className = `msg-row ${type}`;
            
            // Product Detection
            let cards = '';
            if(scan && allProducts.length) {
                const found = allProducts.filter(p => text.includes(p.core.name));
                found.forEach(p => {
                    cards += `
                    <div class="chat-product" onclick="alert('מעבר למוצר')">
                        <img src="${p.rich?.image}" class="cp-img">
                        <div class="cp-info">
                            <div class="cp-title">${p.core.name}</div>
                            <div class="cp-price">₪${p.core.price}</div>
                        </div>
                    </div>`;
                });
            }

            const avatar = type==='user' ? user.avatar : 'https://i.postimg.cc/W3nYsP7X/h-sbn.png';
            
            row.innerHTML = `
                <img src="${avatar}" class="avatar">
                <div class="bubble ${type}">
                    <div class="sender-name">${type==='user'?'אני':'Saban'}</div>
                    ${text.replace(/\n/g, '<br>')}
                    ${cards}
                </div>`;
            
            box.appendChild(row);
            box.scrollTop = box.scrollHeight;
            return row.id;
        }

        // --- Helpers ---
        window.switchView = (v) => {
            document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
            document.getElementById('view-'+v)?.classList.add('active');
            
            document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
            // כאן אפשר להוסיף לוגיקה לסימון האייקון הפעיל
        };

        // פונקציית עדכון עגלה בסיסית (אם חסרה לך)
        function updateCart() {
             // כאן צריך להיות הקוד שמעדכן את ה-HTML של העגלה
             // אם כבר יש לך אותו בקובץ למעלה - מצוין.
             console.log("Cart Updated:", cart);
        }

        // Init
        loadData();
    </script>
