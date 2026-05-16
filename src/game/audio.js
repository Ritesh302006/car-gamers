let ctx = null;
let masterGain = null;
let engineOsc = null;
let engineGain = null;
let muted = false;

function ensureCtx() {
    if (ctx) return ctx;
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
        masterGain = ctx.createGain();
        masterGain.gain.value = muted ? 0 : 0.55;
        masterGain.connect(ctx.destination);
    } catch (error) {
        console.warn("[audio] AudioContext unavailable:", error);
        ctx = null;
    }
    return ctx;
}

export function setMuted(value) {
    muted = !!value;
    if (masterGain) masterGain.gain.value = muted ? 0 : 0.55;
}
export function isMuted() { return muted; }

export function resumeAudio() {
    const c = ensureCtx();
    if (c && c.state === "suspended") c.resume();
}

export function startEngine() {
    const c = ensureCtx();
    if (!c || engineOsc) return;
    engineOsc = c.createOscillator();
    engineOsc.type = "sawtooth";
    engineOsc.frequency.value = 70;
    engineGain = c.createGain();
    engineGain.gain.value = 0;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 480;
    engineOsc.connect(lp).connect(engineGain).connect(masterGain);
    engineOsc.start();
}

export function setEngineIntensity(t) {
    if (!engineOsc || !ctx) return;
    const clamped = Math.max(0, Math.min(1, t));
    engineOsc.frequency.setTargetAtTime(60 + clamped * 130, ctx.currentTime, 0.08);
    engineGain.gain.setTargetAtTime(0.04 + clamped * 0.09, ctx.currentTime, 0.08);
}

export function stopEngine() {
    if (engineOsc) { try { engineOsc.stop(); } catch (e) {} engineOsc.disconnect(); engineOsc = null; }
    if (engineGain) { engineGain.disconnect(); engineGain = null; }
}

function blip({ freq = 440, duration = 0.15, type = "square", gain = 0.18, slideTo = null }) {
    const c = ensureCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + duration);
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    osc.connect(g).connect(masterGain);
    osc.start();
    osc.stop(c.currentTime + duration + 0.02);
}

export function sfxPickup()     { blip({ freq: 660, slideTo: 1320, duration: 0.18, type: "triangle", gain: 0.22 }); }
export function sfxBoost()      { blip({ freq: 220, slideTo: 880,  duration: 0.35, type: "sawtooth", gain: 0.20 }); }
export function sfxShield()     { blip({ freq: 880, slideTo: 1760, duration: 0.25, type: "sine",     gain: 0.22 }); }
export function sfxMultiplier() { blip({ freq: 520, slideTo: 1040, duration: 0.22, type: "square",   gain: 0.20 }); }

export function sfxCrash() {
    const c = ensureCtx();
    if (!c) return;
    const bufferSize = c.sampleRate * 0.6;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    const noise = c.createBufferSource(); noise.buffer = buffer;
    const g = c.createGain(); g.gain.value = 0.5;
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.55);
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 800;
    noise.connect(lp).connect(g).connect(masterGain);
    noise.start(); noise.stop(c.currentTime + 0.6);
}

export function sfxLevelUp() {
    blip({ freq: 440, slideTo: 880, duration: 0.16, type: "triangle", gain: 0.2 });
    setTimeout(() => blip({ freq: 660, slideTo: 1320, duration: 0.18, type: "triangle", gain: 0.2 }), 110);
}
