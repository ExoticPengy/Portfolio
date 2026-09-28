// Pure pixel-effect math shared by the intro and the project transitions.
// No DOM in here, so it runs under vitest's node env.

export type Rect = { x: number; y: number; w: number; h: number };
export type Fit = "cover" | "contain" | "fill";
export type Cell = { x: number; y: number; hx: number; hy: number; vx: number; vy: number; c: string };
export type Pixels = { data: Uint8ClampedArray; width: number; height: number };

export const WIPES = ["tear", "mosaic", "blinds", "slash", "cascade"] as const;
export type WipePattern = (typeof WIPES)[number];

// Where the coin sits in intro.mp4's first frame, as fractions of the rendered video width/height.
// ponytail: measured by eye on the first frame at 1440x900; retune if intro.mp4 changes.
export const COIN = { x: 0.23, y: 0.49, r: 0.13 };

// Averages img into size×size cells. Skips mostly transparent cells, and cells darker than minLum (0..1).
export function sampleCells(img: Pixels, size: number, minLum = 0): Cell[] {
  const out: Cell[] = [];
  for (let cy = 0; cy < img.height; cy += size) {
    for (let cx = 0; cx < img.width; cx += size) {
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let y = cy; y < Math.min(cy + size, img.height); y++) {
        for (let x = cx; x < Math.min(cx + size, img.width); x++) {
          const i = (y * img.width + x) * 4;
          r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; a += img.data[i + 3]; n++;
        }
      }
      r /= n; g /= n; b /= n; a /= n;
      if (a < 128) continue;
      if ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < minLum) continue;
      out.push({ x: cx, y: cy, hx: cx, hy: cy, vx: 0, vy: 0, c: `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})` });
    }
  }
  return out;
}

// One physics frame: pushed away from the pointer inside radius, sprung back home, damped.
export function springStep(k: Cell, px: number, py: number, radius: number): void {
  const dx = k.x - px, dy = k.y - py, d2 = dx * dx + dy * dy;
  if (d2 < radius * radius && d2 > 0.01) {
    const d = Math.sqrt(d2), f = (1 - d / radius) * 6;
    k.vx += (dx / d) * f;
    k.vy += (dy / d) * f;
  }
  k.vx = (k.vx + (k.hx - k.x) * 0.08) * 0.82;
  k.vy = (k.vy + (k.hy - k.y) * 0.08) * 0.82;
  k.x += k.vx;
  k.y += k.vy;
}

// Where a sw×sh source lands inside box under CSS object-fit.
export function fitRect(sw: number, sh: number, box: Rect, fit: Fit): Rect {
  if (fit === "fill") return { ...box };
  const s = fit === "contain" ? Math.min(box.w / sw, box.h / sh) : Math.max(box.w / sw, box.h / sh);
  const w = sw * s, h = sh * s;
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}

export function coinPoint(sw: number, sh: number, box: Rect, fit: Fit) {
  const r = fitRect(sw, sh, box, fit);
  return { x: r.x + COIN.x * r.w, y: r.y + COIN.y * r.h, r: COIN.r * r.w };
}

// Spreads n points over rects in proportion to their area, on an even grid inside each rect.
export function assignTargets(n: number, rects: Rect[]): { x: number; y: number }[] {
  const areas = rects.map((r) => Math.max(0, r.w) * Math.max(0, r.h));
  const total = areas.reduce((a, b) => a + b, 0);
  if (n <= 0 || total <= 0) return [];
  const out: { x: number; y: number }[] = [];
  let cum = 0;
  rects.forEach((r, k) => {
    const before = Math.round((n * cum) / total);
    cum += areas[k];
    const count = Math.round((n * cum) / total) - before;
    if (count <= 0) return;
    const cols = Math.max(1, Math.round(Math.sqrt((count * r.w) / r.h)));
    const rows = Math.ceil(count / cols);
    for (let j = 0; j < count; j++) {
      out.push({ x: r.x + ((j % cols) + 0.5) * (r.w / cols), y: r.y + (Math.floor(j / cols) + 0.5) * (r.h / rows) });
    }
  });
  return out;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Step index per grid cell (row-major) for each encounter wipe. A cell goes black once its step is reached.
export function wipeOrder(pattern: WipePattern, cols: number, rows: number, seed = 7): { steps: number; order: number[] } {
  const n = cols * rows;
  const order = new Array<number>(n);
  if (pattern === "mosaic") {
    const idx = Array.from({ length: n }, (_, i) => i);
    const rnd = mulberry32(seed);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    const steps = Math.min(16, n);
    idx.forEach((cell, rank) => { order[cell] = Math.floor((rank * steps) / n); });
    return { steps, order };
  }
  const strip = Math.ceil(cols / 8); // blinds: 8 slats
  const steps = { tear: cols, blinds: strip, slash: cols + rows - 1, cascade: rows }[pattern];
  for (let i = 0; i < n; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    order[i] =
      pattern === "tear" ? (r % 2 ? cols - 1 - c : c) // rows sweep in alternating directions
      : pattern === "blinds" ? c % strip
      : pattern === "slash" ? c + r
      : r; // cascade
  }
  return { steps, order };
}

// Block sizes for the cover de-resolving out of black. 1 means sharp.
export function deResSteps(): number[] {
  return [64, 32, 16, 8, 1];
}

// Quantises 0..1 progress into frames, so motion advances in visible steps (1/frames at t=0).
export function stepped(t: number, frames: number): number {
  return Math.min(frames, Math.floor(t * frames) + 1) / frames;
}
