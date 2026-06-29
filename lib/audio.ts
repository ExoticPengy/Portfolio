let ctx: AudioContext | null = null;
let enabled = true;
let sfxBus: GainNode | null = null;
let sfxVol = 0.8;
let musicVol = 0.5;

function getSfxBus(c: AudioContext): GainNode {
  if (!sfxBus) {
    sfxBus = c.createGain();
    sfxBus.connect(c.destination);
  }
  sfxBus.gain.value = sfxVol;
  return sfxBus;
}

// Perceptual curve — linear sliders sound jumpy at the low end; square it.
const curve = (v: number) => { const c = Math.max(0, Math.min(1, v)); return c * c; };

export function setSfxVolume(v: number) {
  sfxVol = curve(v);
  if (sfxBus && ctx) {
    sfxBus.gain.cancelScheduledValues(ctx.currentTime);
    sfxBus.gain.setTargetAtTime(sfxVol, ctx.currentTime, 0.02);
  }
}

export function setMusicVolume(v: number) {
  musicVol = curve(v);
  if (musicGain && ctx) {
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.setTargetAtTime(musicVol, ctx.currentTime, 0.03);
  }
}

function getCtx(): AudioContext | null {
  if (!ctx) {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function noiseBuffer(duration: number): AudioBuffer | null {
  const c = getCtx();
  if (!c) return null;
  const buf = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

export function whoosh(intensity = 1) {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const dur = 0.55;
  const src = c.createBufferSource();
  const buf = noiseBuffer(dur);
  if (!buf) return;
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(200, c.currentTime);
  filter.frequency.exponentialRampToValueAtTime(3200, c.currentTime + dur * 0.7);
  filter.frequency.exponentialRampToValueAtTime(180, c.currentTime + dur);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.18 * intensity, c.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  src.connect(filter).connect(gain).connect(getSfxBus(c));
  src.start();
  src.stop(c.currentTime + dur);
}

export function click(pitch = 880) {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(pitch, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, c.currentTime + 0.08);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.08, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.09);
  osc.connect(gain).connect(getSfxBus(c));
  osc.start();
  osc.stop(c.currentTime + 0.1);
}

export function hover() {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, c.currentTime);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.03, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
  osc.connect(gain).connect(getSfxBus(c));
  osc.start();
  osc.stop(c.currentTime + 0.06);
}

export function thud() {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.25);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.25, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
  osc.connect(gain).connect(getSfxBus(c));
  osc.start();
  osc.stop(c.currentTime + 0.3);
}

export function jingle() {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const notes = [523, 659, 784, 1047]; // C E G C — rising arpeggio
  notes.forEach((f, i) => {
    const t = c.currentTime + i * 0.09;
    const osc = c.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(f, t);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(g).connect(getSfxBus(c));
    osc.start(t);
    osc.stop(t + 0.2);
  });
}

export function coinClink() {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const bus = getSfxBus(c);
  [988, 1319].forEach((f, i) => { // B5 → E6, classic coin ding
    const t = c.currentTime + i * 0.08;
    const osc = c.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(f, t);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g).connect(bus);
    osc.start(t);
    osc.stop(t + 0.13);
  });
}

export function coinDrop() {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const bus = getSfxBus(c);
  // descending tone — the fall
  const osc = c.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1200, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, c.currentTime + 1.1);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.07, c.currentTime + 0.05);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.1);
  osc.connect(g).connect(bus);
  osc.start();
  osc.stop(c.currentTime + 1.2);
  // metallic rattles bouncing down the passage
  for (let i = 0; i < 5; i++) {
    const t = c.currentTime + 0.15 + i * 0.2;
    const buf = noiseBuffer(0.05);
    if (!buf) continue;
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 2000 + Math.random() * 1500;
    f.Q.value = 8;
    const gg = c.createGain();
    gg.gain.setValueAtTime(0.06, t);
    gg.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    src.connect(f).connect(gg).connect(bus);
    src.start(t);
    src.stop(t + 0.06);
  }
}

export function setEnabled(v: boolean) { enabled = !!v; }
export function init() { getCtx(); }

// --- Background music: procedural chiptune loop ---
// ponytail: 16-bar / 64-step loop (~8.3s). Lengthen MELODY/CHORDS further if needed.
let musicOn = false;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let musicGain: GainNode | null = null;
let nextStepTime = 0;
let step = 0;

const STEP_DUR = 0.13;                 // seconds per 8th note (snappier tempo)
const SEMI = (n: number) => 261.63 * Math.pow(2, n / 12); // base C4

// 16 bars, one chord root per bar (4 steps each). C major, upbeat pop motion.
const CHORDS = [
  0, 7, 9, 5,  0, 7, 5, 7,   // C G Am F  C G F G
  9, 5, 0, 7,  5, 0, 7, 7,   // Am F C G  F C G G
];

// 64-step lead melody (semitone from C4, REST = silence). Outlines the chords
// with passing tones + register shifts so the loop sounds composed, not looped.
const REST = -99;
const MELODY = [
  12, 4, 7, 4,    14, 11, 7, 11,   16, 12, 9, 12,   12, 9, 5, 9,    // bars 1-4
  7, 4, 0, 4,     11, 7, 11, 14,   12, 9, 12, 17,   14, 11, 7, REST, // bars 5-8
  21, 16, 12, 16, 17, 12, 9, 12,   16, 12, 7, 12,   14, 11, 7, 11,  // bars 9-12
  17, 12, 9, 5,   12, 7, 4, 0,     11, 14, 11, 7,   7, 11, 14, REST, // bars 13-16
];
const TOTAL = MELODY.length;

function voice(c: AudioContext, freq: number, t: number, dur: number, type: OscillatorType, vol: number) {
  if (!musicGain) return;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(musicGain);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function kick(c: AudioContext, t: number) {
  if (!musicGain) return;
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  const g = c.createGain();
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
  osc.connect(g).connect(musicGain);
  osc.start(t);
  osc.stop(t + 0.16);
}

function noiseHit(c: AudioContext, t: number, dur: number, vol: number, hp: number) {
  if (!musicGain) return;
  const buf = noiseBuffer(dur);
  if (!buf) return;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = hp;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(musicGain);
  src.start(t);
  src.stop(t + dur);
}

function scheduleStep(c: AudioContext, t: number) {
  const root = CHORDS[Math.floor(step / 4) % CHORDS.length];
  // lead melody
  const note = MELODY[step % TOTAL];
  if (note > REST) voice(c, SEMI(note), t, STEP_DUR * 0.85, "square", 0.08);
  // bouncing bass: root on the beat, fifth on the off-beat
  const bassSemi = root - 12 + (step % 2 === 1 ? 7 : 0);
  voice(c, SEMI(bassSemi), t, STEP_DUR * 0.9, "triangle", 0.12);
  // drums
  if (step % 4 === 0) kick(c, t);
  if (step % 8 === 4) noiseHit(c, t, 0.12, 0.18, 1500); // snare backbeat
  noiseHit(c, t, 0.03, step % 2 === 0 ? 0.05 : 0.09, 7000); // hi-hat, offbeat accent
}

function scheduler() {
  const c = getCtx();
  if (!c || !musicOn) return;
  while (nextStepTime < c.currentTime + 0.1) {
    scheduleStep(c, nextStepTime);
    nextStepTime += STEP_DUR;
    step = (step + 1) % TOTAL;
  }
}

export function startMusic() {
  const c = getCtx();
  if (!c || musicOn) return;
  musicOn = true;
  musicGain = c.createGain();
  musicGain.gain.setValueAtTime(0.0001, c.currentTime);
  musicGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, musicVol), c.currentTime + 1.5); // fade in
  musicGain.connect(c.destination);
  step = 0;
  nextStepTime = c.currentTime + 0.1;
  musicTimer = setInterval(scheduler, 25);
}

export function stopMusic() {
  if (!musicOn) return;
  musicOn = false;
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  if (ctx && musicGain) {
    const g = musicGain;
    g.gain.cancelScheduledValues(ctx.currentTime);
    g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4); // fade out
    setTimeout(() => { try { g.disconnect(); } catch { /* ignore */ } }, 500);
    musicGain = null;
  }
}
