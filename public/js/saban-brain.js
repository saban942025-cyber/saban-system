// public/js/device-brain.js (או בתוך הסקריפט ב-Head)
const SabanBrain = {
    detectDevice: () => {
        const ua = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(ua);
        const deviceType = isMobile ? 'mobile' : 'desktop';
        
        console.log(`📡 Saban OS detected: ${deviceType}`);
        document.body.setAttribute('data-device', deviceType);
        
        // התאמת גובה למובייל (למניעת גלילה כפולה)
        if(isMobile) {
            document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        }
    },
    
    // ניהול טאבים חכם
    switchTab: (url) => {
        const frame = document.getElementById('app-frame');
        frame.style.opacity = '0'; // Fade Out
        setTimeout(() => {
            frame.src = url;
            frame.onload = () => { frame.style.opacity = '1'; }; // Fade In
        }, 150);
    }
};

window.addEventListener('resize', SabanBrain.detectDevice);
window.addEventListener('load', SabanBrain.detectDevice);
