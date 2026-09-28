"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  sampleCells, springStep, assignTargets, fitRect, wipeOrder, deResSteps, stepped,
  type Cell, type Fit, type Rect, type WipePattern,
} from "@/lib/pixels";

const TITLE_CELL = 6;
const SHATTER_CELL = 10;
const MAX_CELLS = 5000; // ponytail: hard cap keeps the shatter near 60fps; raise it if a trace shows headroom
const GRID_COLS = 32;
const GRID_ROWS = 18;

export function motionOk(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  return !("lite" in document.documentElement.dataset);
}

export interface PixelHandle {
  title(el: HTMLElement): Promise<void>;
  implode(to: { x: number; y: number; r: number }): Promise<void>;
  flashOut(ms: number): Promise<void>;
  shatter(src: CanvasImageSource, sw: number, sh: number, fit: Fit, targets: Rect[]): Promise<void>;
  encounter(pattern: WipePattern, from: HTMLImageElement, onBlack: () => void, getTo: () => HTMLImageElement | null, onBeat?: () => void): Promise<void>;
  reverse(img: HTMLImageElement, onBlack: () => void): Promise<void>;
  clear(): void;
}

type Props = { z: number; onReady?: () => void };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function offscreen(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

// Draws src into a w×h canvas the way CSS object-fit would, over an optional background colour.
function snapshot(src: CanvasImageSource, sw: number, sh: number, w: number, h: number, fit: Fit, bg?: string) {
  const c = offscreen(w, h), o = c.getContext("2d")!;
  if (bg) { o.fillStyle = bg; o.fillRect(0, 0, c.width, c.height); }
  const r = fitRect(sw, sh, { x: 0, y: 0, w: c.width, h: c.height }, fit);
  o.drawImage(src, r.x, r.y, r.w, r.h);
  return c;
}

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

// An <img> as it currently looks on screen: its rect plus a canvas copy honouring object-fit and background.
function imgSnapshot(img: HTMLImageElement) {
  const r = img.getBoundingClientRect();
  const cs = getComputedStyle(img);
  const fit: Fit = cs.objectFit === "contain" || cs.objectFit === "cover" ? cs.objectFit : "fill";
  return {
    rect: { x: r.x, y: r.y, w: r.width, h: r.height },
    canvas: snapshot(img, img.naturalWidth, img.naturalHeight, r.width, r.height, fit, cs.backgroundColor),
  };
}

// Effective opacity of el on screen (product of its ancestors' computed opacity).
function shown(el: Element) {
  let o = 1;
  for (let e: Element | null = el; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
  return o;
}

// Draws src into rect as blocks of `block` CSS pixels (1 = sharp).
function drawBlocky(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, rect: Rect, block: number) {
  if (block <= 1) { ctx.drawImage(src, rect.x, rect.y, rect.w, rect.h); return; }
  const small = offscreen(rect.w / block, rect.h / block);
  small.getContext("2d")!.drawImage(src, 0, 0, small.width, small.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, rect.x, rect.y, rect.w, rect.h);
  ctx.imageSmoothingEnabled = true;
}

// A gold pixel coin centred on `to`, as cells.
function coinCells(to: { x: number; y: number; r: number }, cell: number): Cell[] {
  const r = to.r, c = offscreen(r * 2 + 2, r * 2 + 2), o = c.getContext("2d")!;
  o.fillStyle = "#b8860b";
  o.beginPath(); o.arc(r + 1, r + 1, r, 0, Math.PI * 2); o.fill();
  o.fillStyle = "#f5b82e";
  o.beginPath(); o.arc(r + 1, r + 1, r * 0.86, 0, Math.PI * 2); o.fill();
  o.fillStyle = "#ffe08a";
  o.beginPath(); o.arc(r * 0.8, r * 0.8, r * 0.3, 0, Math.PI * 2); o.fill();
  return sampleCells(o.getImageData(0, 0, c.width, c.height), cell).map((k) => {
    const x = k.hx + to.x - r, y = k.hy + to.y - r;
    return { ...k, x, y, hx: x, hy: y };
  });
}

export default forwardRef<PixelHandle, Props>(function PixelCanvas({ z, onReady }, ref) {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gen = useRef(0); // bumped by every new animation, clear() and unmount; stale loops exit
  const size = useRef({ w: 0, h: 0 });
  const cells = useRef<Cell[]>([]);

  useEffect(() => {
    setMounted(true);
    // gen is a counter, not a DOM ref; bumping the live value is the point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { gen.current++; };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const c = canvasRef.current!;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth, h = window.innerHeight;
      size.current = { w, h };
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      c.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);
    onReady?.();
    return () => window.removeEventListener("resize", fit);
    // onReady is read once, when the canvas first exists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useImperativeHandle(ref, () => {
    const ctx = () => canvasRef.current?.getContext("2d") ?? null;
    const wipe = () => ctx()?.clearRect(0, 0, size.current.w, size.current.h);
    const black = (c: CanvasRenderingContext2D, a: number) => {
      c.globalAlpha = a; c.fillStyle = "#000"; c.fillRect(0, 0, size.current.w, size.current.h); c.globalAlpha = 1;
    };

    // Calls draw(t, ctx) every frame for ms, t from 0 to 1. Resolves early, without drawing, once a newer animation starts.
    const run = (my: number, ms: number, draw: (t: number, c: CanvasRenderingContext2D) => void) =>
      new Promise<void>((resolve) => {
        const t0 = performance.now();
        const frame = (now: number) => {
          const c = ctx();
          if (my !== gen.current || !c) return resolve();
          const t = Math.min(1, Math.max(0, (now - t0) / ms));
          draw(t, c);
          if (t < 1) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });

    return {
      async title(el) {
        const my = ++gen.current; // claim first, so a later implode/clear can cancel us while fonts load
        await document.fonts?.ready;
        if (my !== gen.current) return;
        const { w, h } = size.current;
        const box = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const pal = getComputedStyle(document.body);
        const off = offscreen(w, h), o = off.getContext("2d")!;
        const g = o.createLinearGradient(box.left, 0, box.right, 0);
        g.addColorStop(0, pal.getPropertyValue("--accent").trim() || "#b06cff");
        g.addColorStop(1, pal.getPropertyValue("--accent-2").trim() || "#00e6ff");
        o.fillStyle = g;
        o.font = cs.font || `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        o.textAlign = "center";
        o.textBaseline = "middle";
        o.fillText(el.textContent ?? "", box.left + box.width / 2, box.top + box.height / 2);
        // ponytail: cells are laid out once; a resize while idling keeps the old layout until the next visit.
        cells.current = sampleCells(o.getImageData(0, 0, w, h), TITLE_CELL);

        const ptr = { x: -1e4, y: -1e4 };
        const move = (e: PointerEvent) => { ptr.x = e.clientX; ptr.y = e.clientY; };
        window.addEventListener("pointermove", move);
        const frame = () => {
          const c = ctx();
          if (my !== gen.current || !c) { window.removeEventListener("pointermove", move); return; }
          wipe();
          for (const k of cells.current) {
            springStep(k, ptr.x, ptr.y, 90);
            c.globalAlpha = 0.8 + Math.random() * 0.2; // CRT shimmer
            c.fillStyle = k.c;
            c.fillRect(k.x, k.y, TITLE_CELL - 1, TITLE_CELL - 1);
          }
          c.globalAlpha = 1;
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      },

      implode(to) {
        const my = ++gen.current;
        const from = cells.current.map((k) => ({ x: k.x, y: k.y, c: k.c }));
        if (!from.length) return Promise.resolve();
        // Coin cells sized so their count roughly matches the title's; every title cell gets a coin cell.
        const cell = Math.max(TITLE_CELL, Math.round(Math.sqrt((Math.PI * to.r * to.r) / from.length)));
        const coin = coinCells(to, cell);
        if (!coin.length) return Promise.resolve();
        // Per-cell delay and spin, so the word swirls apart instead of rotating as one rigid piece.
        const delay = from.map(() => Math.random() * 0.3);
        const spin = from.map(() => Math.PI * (1 + Math.random() * 1.5));
        return run(my, 800, (t, c) => {
          wipe();
          for (let i = 0; i < from.length; i++) {
            const a = from[i], b = coin[Math.floor((i * coin.length) / from.length)];
            const e = ease(Math.min(1, Math.max(0, (t - delay[i]) / 0.7)));
            const s = TITLE_CELL - 1 + (cell - TITLE_CELL) * e;
            const ang = (1 - e) * spin[i]; // spiral in, unwinding to zero as the cell lands
            const dx = a.x + (b.hx - a.x) * e - to.x, dy = a.y + (b.hy - a.y) * e - to.y;
            c.fillStyle = e > 0.6 ? b.c : a.c;
            c.fillRect(to.x + dx * Math.cos(ang) - dy * Math.sin(ang), to.y + dx * Math.sin(ang) + dy * Math.cos(ang), s, s);
          }
        });
      },

      async flashOut(ms) {
        const my = ++gen.current;
        const { w, h } = size.current;
        const el = canvasRef.current;
        if (!el) return;
        const still = offscreen(el.width, el.height);
        still.getContext("2d")!.drawImage(el, 0, 0);
        await run(my, ms, (t, c) => {
          wipe();
          c.globalAlpha = 1 - t;
          c.drawImage(still, 0, 0, w, h);
          c.globalAlpha = 1;
        });
        if (my === gen.current) wipe();
      },

      async shatter(src, sw, sh, fit, targets) {
        const my = ++gen.current;
        const { w, h } = size.current;
        const frame = snapshot(src, sw, sh, w, h, fit, "#000");
        // Draw the frozen frame now, in the same tick the caller hides the video, so nothing flickers.
        const c0 = ctx();
        if (c0) { c0.clearRect(0, 0, w, h); c0.drawImage(frame, 0, 0, w, h); }
        let pts = sampleCells(frame.getContext("2d")!.getImageData(0, 0, frame.width, frame.height), SHATTER_CELL, 0.08);
        const stride = Math.ceil(pts.length / MAX_CELLS);
        if (stride > 1) pts = pts.filter((_, i) => i % stride === 0);
        const dest = assignTargets(pts.length, targets);
        if (!dest.length) { wipe(); throw new Error("shatter: no targets"); }
        const delay = pts.map(() => Math.random() * 0.35);
        const cx = w / 2, cy = h / 2, s = SHATTER_CELL - 1;
        const pos = (i: number, t: number) => {
          const p = pts[i], d = dest[i];
          const e = ease(Math.min(1, Math.max(0, (t - delay[i]) / 0.6)));
          const bx = p.hx - cx, by = p.hy - cy, bl = Math.hypot(bx, by) || 1;
          const arc = Math.sin(Math.PI * e) * 140; // burst outward, then curve into the card
          return [p.hx + (d.x - p.hx) * e + (bx / bl) * arc, p.hy + (d.y - p.hy) * e + (by / bl) * arc];
        };
        await run(my, 1400, (t, c) => {
          wipe();
          const fade = t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25;
          for (let i = 0; i < pts.length; i++) {
            c.fillStyle = pts[i].c;
            const [tx, ty] = pos(i, t - 0.03); // short trail
            c.globalAlpha = fade * 0.35;
            c.fillRect(tx, ty, s, s);
            const [x, y] = pos(i, t);
            c.globalAlpha = fade;
            c.fillRect(x, y, s, s);
          }
          c.globalAlpha = 1;
        });
        if (my === gen.current) wipe();
      },

      async encounter(pattern, from, onBlack, getTo, onBeat) {
        const my = ++gen.current;
        const el = canvasRef.current;
        if (!el) { onBlack(); return; }
        const { w, h } = size.current;
        const src = imgSnapshot(from);

        let last = -1;
        // 1. Lock-on: the clicked cover snaps to pixels and pulses once.
        await run(my, 150, (t, c) => {
          wipe();
          const k = 1 + 0.05 * Math.sin(Math.PI * t), r = src.rect;
          drawBlocky(c, src.canvas, { x: r.x - (r.w * (k - 1)) / 2, y: r.y - (r.h * (k - 1)) / 2, w: r.w * k, h: r.h * k }, 12);
        });

        // 2. Beats: the screen dims in three hard steps while the cover pulses on each one.
        // ponytail: darkening only, never a light/dark flip, so nothing strobes (photosensitive safety).
        await run(my, 252, (t, c) => {
          const i = Math.min(2, Math.floor(t * 3));
          const r = src.rect, k = 1 + 0.06 * Math.sin(Math.PI * ((t * 3) % 1));
          if (i !== last) { last = i; onBeat?.(); }
          wipe();
          c.fillStyle = `rgba(0,0,0,${0.25 * (i + 1)})`;
          c.fillRect(0, 0, w, h);
          drawBlocky(c, src.canvas, { x: r.x - (r.w * (k - 1)) / 2, y: r.y - (r.h * (k - 1)) / 2, w: r.w * k, h: r.h * k }, 12);
        });

        // 3. Stepped wipe: black cells fill in pattern order, 8 visible frames (about 15fps).
        const { steps, order } = wipeOrder(pattern, GRID_COLS, GRID_ROWS);
        const cw = Math.ceil(w / GRID_COLS), ch = Math.ceil(h / GRID_ROWS);
        await run(my, 533, (t, c) => {
          const upto = stepped(t, 8) * steps;
          wipe();
          c.fillStyle = "rgba(0,0,0,0.75)"; // hold the beats' dim so the wipe only ever darkens
          c.fillRect(0, 0, w, h);
          c.fillStyle = "#000";
          for (let i = 0; i < order.length; i++) {
            if (order[i] < upto) c.fillRect((i % GRID_COLS) * cw, Math.floor(i / GRID_COLS) * ch, cw, ch);
          }
        });
        if (my !== gen.current) return;
        onBlack();
        await nextFrame();
        await nextFrame(); // let React commit the detail view under the black

        // 4. Reveal: the detail cover de-resolves out of black while the black lifts.
        const to = getTo();
        if (!to || !to.complete || !to.naturalWidth) {
          await run(my, 200, (t, c) => { wipe(); black(c, 1 - t); });
          if (my === gen.current) wipe();
          return;
        }
        const dst = imgSnapshot(to);
        const blocks = deResSteps();
        await run(my, 400, (t, c) => {
          const b = blocks[Math.min(blocks.length - 1, Math.floor(t * blocks.length))];
          wipe();
          black(c, 1 - t);
          drawBlocky(c, dst.canvas, dst.rect, b);
        });
        // Hold the sharp cover while the real hero finishes its CSS fade-in, so there is no empty frame.
        await run(my, 900, (t, c) => {
          wipe();
          const o = shown(to);
          if (o < 0.99) { c.globalAlpha = 1 - o; drawBlocky(c, dst.canvas, dst.rect, 1); c.globalAlpha = 1; }
        });
        if (my === gen.current) wipe();
      },

      async reverse(img, onBlack) {
        const my = ++gen.current;
        const src = imgSnapshot(img);
        const blocks = deResSteps().slice(0, -1).reverse(); // 8, 16, 32, 64
        await run(my, 240, (t, c) => {
          wipe();
          black(c, t);
          drawBlocky(c, src.canvas, src.rect, blocks[Math.min(blocks.length - 1, Math.floor(t * blocks.length))]);
        });
        if (my !== gen.current) return;
        onBlack();
        await nextFrame();
        await run(my, 120, (t, c) => { wipe(); black(c, 1 - t); });
        if (my === gen.current) wipe();
      },

      clear() {
        gen.current++;
        wipe();
      },
    };
  }, []);

  if (!mounted) return null;
  return createPortal(
    <canvas ref={canvasRef} className="pixel-canvas" style={{ zIndex: z }} aria-hidden="true" />,
    document.body,
  );
});
