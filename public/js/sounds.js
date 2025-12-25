// public/js/sounds.js
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const SabanSounds = {
    init: () => {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => console.log("🔊 Audio System Unlocked"));
        }
    },
    beep: (freq = 800, type = 'sine') => {
        try {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        } catch (e) { console.error(e); }
    },
    playMessage: () => SabanSounds.beep(800, 'sine'),
    playAlert: () => SabanSounds.beep(400, 'square')
};
