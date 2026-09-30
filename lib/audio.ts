import { SCALE, walk } from "./music";

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

// Tiny single-tone blip on the SFX bus; the building block for the short UI sounds below.
function blip(c: AudioContext, freq: number, t: number, dur: number, type: OscillatorType, vol: number, to = freq) {
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to !== freq) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(getSfxBus(c));
  osc.start(t);
  osc.stop(t + dur + 0.01);
}

function sfx(): AudioContext | null {
  return enabled ? getCtx() : null;
}

export function tick() {
  const c = sfx();
  if (c) blip(c, 1500, c.currentTime, 0.03, "sine", 0.05);
}

// Dialogue text blip, pitch jittered so a long line does not drone.
export function typeBlip() {
  const c = sfx();
  if (c) blip(c, 560 + Math.random() * 80, c.currentTime, 0.025, "square", 0.02);
}

// "A wild X appeared!": a quick up-down flutter, then a held high note.
export function encounter() {
  const c = sfx();
  if (!c) return;
  [330, 660, 330, 660].forEach((f, i) => blip(c, f, c.currentTime + i * 0.05, 0.05, "square", 0.05));
  blip(c, 880, c.currentTime + 0.2, 0.3, "square", 0.05);
}

// Pokémon attack: a hit that drops in pitch plus a short burst of noise.
export function hit() {
  const c = sfx();
  if (!c) return;
  blip(c, 600, c.currentTime, 0.15, "square", 0.08, 90);
  const buf = noiseBuffer(0.12);
  if (!buf) return;
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(0.12, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.12);
  src.connect(g).connect(getSfxBus(c));
  src.start();
}

// --- Background music: slow generative chiptune ---
// A fixed chord loop under a melody that random-walks the pentatonic scale, so it never repeats note for note.
let musicOn = false;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let musicGain: GainNode | null = null;
let nextStepTime = 0;
let step = 0;
let note = 4;
let padFilter: BiquadFilterNode | null = null;

const STEP_DUR = 0.43; // 8th note at ~70 BPM
const BAR = 8;
const SEMI = (n: number) => 261.63 * Math.pow(2, n / 12); // from C4

// Two bars per chord: F  C  G  Am, as semitones from C4.
const CHORDS = [[5, 9, 12], [0, 4, 7], [7, 11, 14], [9, 12, 16]];

function tone(c: AudioContext, freq: number, t: number, attack: number, dur: number, type: OscillatorType, vol: number, dest: AudioNode) {
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(dest);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function scheduleStep(c: AudioContext, t: number, out: GainNode, pad: BiquadFilterNode) {
  const chord = CHORDS[Math.floor(step / (BAR * 2)) % CHORDS.length];
  if (step % (BAR * 2) === 0) {
    const len = STEP_DUR * BAR * 2;
    chord.forEach((n) => tone(c, SEMI(n - 12), t, 1.2, len, "sawtooth", 0.03, pad));
  }
  if (step % BAR === 0) tone(c, SEMI(chord[0] - 24), t, 0.02, STEP_DUR * BAR, "sine", 0.14, out);
  // Mostly on the beat, sometimes off it, often silent: space is what keeps it calm.
  if (Math.random() < (step % 2 === 0 ? 0.55 : 0.12)) {
    note = walk(note, Math.random);
    tone(c, SEMI(SCALE[note] + 12), t, 0.03, STEP_DUR * 2.5, "triangle", 0.09, out);
  }
}

function scheduler() {
  const c = getCtx();
  if (!c || !musicOn || !musicGain || !padFilter) return;
  if (document.hidden) return; // background tab: let the tails ring out, pick up again on return
  if (nextStepTime < c.currentTime) nextStepTime = c.currentTime + 0.05; // resync after a pause, no burst
  while (nextStepTime < c.currentTime + 0.2) {
    scheduleStep(c, nextStepTime, musicGain, padFilter);
    nextStepTime += STEP_DUR;
    step++;
  }
}

export function startMusic() {
  const c = getCtx();
  if (!c || musicOn) return;
  musicOn = true;
  musicGain = c.createGain();
  musicGain.gain.setValueAtTime(0.0001, c.currentTime);
  musicGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, musicVol), c.currentTime + 3); // slow fade in
  musicGain.connect(c.destination);

  // Echo: dotted-8th delay, darkened each repeat, fed back at 35%.
  const delay = c.createDelay(1);
  delay.delayTime.value = STEP_DUR * 1.5;
  const fb = c.createGain();
  fb.gain.value = 0.35;
  const dark = c.createBiquadFilter();
  dark.type = "lowpass";
  dark.frequency.value = 1800;
  const wet = c.createGain();
  wet.gain.value = 0.4;
  musicGain.connect(delay).connect(dark).connect(fb).connect(delay);
  dark.connect(wet).connect(c.destination);

  padFilter = c.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 700;
  padFilter.connect(musicGain);

  step = 0;
  nextStepTime = c.currentTime + 0.1;
  musicTimer = setInterval(scheduler, 50);
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
    padFilter = null;
  }
}
