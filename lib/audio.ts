let ctx: AudioContext | null = null;
let enabled = true;

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
  src.connect(filter).connect(gain).connect(c.destination);
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
  osc.connect(gain).connect(c.destination);
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
  osc.connect(gain).connect(c.destination);
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
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.3);
}

export function setEnabled(v: boolean) { enabled = !!v; }
export function init() { getCtx(); }
