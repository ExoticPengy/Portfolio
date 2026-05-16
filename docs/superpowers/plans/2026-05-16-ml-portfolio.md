# ML Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the high-fidelity Claude Design handoff (synthwave arcade stage-select portfolio) into a production Next.js 15 + TypeScript app deployable to Cloudflare Pages.

**Architecture:** Single-page Next.js App Router site. One client `<Stage />` component owns view state and a continuous 3D scene. Section views overlay via opacity (not routes) to keep the cinematic fly-through intact. React Context + `localStorage` persist Tweaks settings. Web Audio synth, no audio files. Granular components and hooks per spec §4.

**Tech Stack:** Next.js 15 (App Router) · React 18 · TypeScript · `next/font` · global CSS with `[data-palette]` custom-property selectors · Web Audio API · pnpm · Cloudflare Pages via `@cloudflare/next-on-pages`.

**Spec reference:** `docs/superpowers/specs/2026-05-16-ml-portfolio-design.md`
**Design source files:** `design_handoff_ml_portfolio/` (gitignored; reference only — DO NOT import or ship). Copy values from `README.md`, `styles.css`, `audio.js`, `app.jsx`, `sections.jsx`, `tweaks-panel.jsx`.

**Note on testing:** Per spec §10, no automated tests in v1. Each task ends with a manual browser verification step. The dev server (`pnpm dev` on http://localhost:3000) is the test harness.

---

## Task 1: Scaffold project (Next.js 15 + TypeScript + pnpm + Cloudflare + fonts)

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `app/layout.tsx` (placeholder), `app/page.tsx` (placeholder), `app/globals.css` (empty), `.gitignore` updates, `.npmrc`
- Create: `wrangler.toml`

- [ ] **Step 1: Scaffold with create-next-app**

`create-next-app` refuses a non-empty target dir. Scaffold into a sibling temp dir, then move contents over (preserving existing `.gitignore`, `README.md`, `docs/`, and the gitignored `design_handoff_ml_portfolio/`):

```bash
cd ..
pnpm dlx create-next-app@latest _portfolio_scaffold \
  --typescript --eslint --app --no-src-dir \
  --import-alias "@/*" --no-tailwind --no-turbopack --use-pnpm --yes
# Move scaffold over existing repo; do not clobber README.md, .gitignore, docs/.
rsync -a --ignore-existing _portfolio_scaffold/ Portfolio/
# Pick up the scaffold's package.json, tsconfig, next.config, etc. that we DO want:
cp _portfolio_scaffold/package.json Portfolio/package.json
cp _portfolio_scaffold/tsconfig.json Portfolio/tsconfig.json
cp _portfolio_scaffold/next.config.ts Portfolio/next.config.ts 2>/dev/null || cp _portfolio_scaffold/next.config.mjs Portfolio/next.config.mjs
cp _portfolio_scaffold/next-env.d.ts Portfolio/next-env.d.ts
cp _portfolio_scaffold/eslint.config.mjs Portfolio/eslint.config.mjs 2>/dev/null || true
cp -r _portfolio_scaffold/app Portfolio/app
cp _portfolio_scaffold/.gitignore Portfolio/.gitignore.scaffold
rm -rf _portfolio_scaffold
cd Portfolio
# Merge gitignore: keep existing /design_handoff_ml_portfolio line, append scaffold's lines.
cat .gitignore.scaffold >> .gitignore
rm .gitignore.scaffold
pnpm install
```

- [ ] **Step 2: Verify scaffold runs**

```bash
pnpm dev
```

Expected: dev server starts, http://localhost:3000 shows the default Next.js starter. Ctrl-C to stop.

- [ ] **Step 3: Install Cloudflare adapter**

```bash
pnpm add -D @cloudflare/next-on-pages wrangler vercel
```

- [ ] **Step 4: Create `wrangler.toml`**

```toml
name = "ml-portfolio"
compatibility_date = "2026-05-16"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"
```

- [ ] **Step 5: Add Cloudflare scripts to package.json**

In `package.json` `"scripts"` add:

```json
"pages:build": "pnpm dlx @cloudflare/next-on-pages",
"pages:preview": "pnpm pages:build && pnpm dlx wrangler pages dev",
"pages:deploy": "pnpm pages:build && pnpm dlx wrangler pages deploy"
```

- [ ] **Step 6: Append to `.gitignore`**

```
# Next.js
.next/
out/

# Cloudflare
.vercel/
.wrangler/

# Env
.env*.local
```

(Keep the existing `/design_handoff_ml_portfolio` line.)

- [ ] **Step 7: Verify build works**

```bash
pnpm build
```

Expected: build completes without errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "scaffold Next.js 15 app with Cloudflare Pages target"
```

---

## Task 2: Self-hosted fonts via next/font

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Configure fonts in `app/layout.tsx`**

Replace the whole file with:

```tsx
import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chong Ming Li — Software Developer · Data Scientist",
  description: "Personal portfolio. Stage select.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body data-palette="purple">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Open http://localhost:3000. View page source. Expected: `<html>` element has all three `--font-*` variable class names; `<body>` has `data-palette="purple"`. No console errors.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "configure self-hosted Archivo Black / Space Grotesk / Space Mono via next/font"
```

---

## Task 3: Data + types (panels, palettes, view types)

**Files:**
- Create: `lib/types.ts`, `lib/palettes.ts`, `lib/panels.ts`

- [ ] **Step 1: Create `lib/types.ts`**

```ts
export type View = "home" | "flying" | "about" | "projects" | "skills" | "contact";

export type PaletteName =
  | "purple"
  | "purple-gold"
  | "purple-lime"
  | "arcade"
  | "cyan"
  | "acid"
  | "orange"
  | "mono"
  | "magenta";

export type PanelData = {
  id: Exclude<View, "home" | "flying">;
  num: string;
  label: string;
  sub: string;
  img: string;
  glyph: string;
  x: number;
  y: number;
  z: number;
  ry: number;
  rx: number;
  delay: number;
};

export type Tweaks = {
  palette: PaletteName;
  sunburst: boolean;
  scanlines: boolean;
  grain: boolean;
  motionIntensity: number; // 1..10
  soundEnabled: boolean;
};

export const DEFAULT_TWEAKS: Tweaks = {
  palette: "purple",
  sunburst: true,
  scanlines: true,
  grain: true,
  motionIntensity: 8,
  soundEnabled: true,
};
```

- [ ] **Step 2: Create `lib/palettes.ts`**

```ts
import type { PaletteName } from "./types";

export const PALETTE_OPTIONS: { value: PaletteName; label: string }[] = [
  { value: "purple",      label: "Purple · Cyan" },
  { value: "purple-gold", label: "Purple · Gold" },
  { value: "purple-lime", label: "Purple · Lime" },
  { value: "arcade",      label: "Arcade · Pink/Yellow" },
  { value: "cyan",        label: "Cyan · Electric" },
  { value: "acid",        label: "Acid · Violet" },
  { value: "orange",      label: "Orange · Navy" },
  { value: "mono",        label: "Mono · Red" },
  { value: "magenta",     label: "Magenta · Lime" },
];
```

- [ ] **Step 3: Create `lib/panels.ts`**

Copy exactly from `design_handoff_ml_portfolio/app.jsx:9-14`:

```ts
import type { PanelData } from "./types";

export const PANELS: PanelData[] = [
  { id: "about",    num: "01", label: "ABOUT",    sub: "CHARACTER",      img: "portrait · 4:5",  glyph: "◆", x: -380, y: -215, z: 100, ry:  16, rx: -3, delay: 0    },
  { id: "projects", num: "02", label: "PROJECTS", sub: "STAGES CLEARED", img: "cover · 4:3",     glyph: "▲", x:  380, y: -215, z:  40, ry: -16, rx: -3, delay: 0.8  },
  { id: "skills",   num: "03", label: "SKILLS",   sub: "ABILITIES",      img: "matrix · 4:3",    glyph: "★", x: -400, y:  235, z: 140, ry:  14, rx:  3, delay: 2.4  },
  { id: "contact",  num: "04", label: "CONTACT",  sub: "CONNECT",        img: "channels · 4:3",  glyph: "◉", x:  400, y:  235, z:  60, ry: -14, rx:  3, delay: 1.6  },
];

export const TICKER_BITS = ["STARS · 27", "COINS · 99", "HI · 999K"];
```

- [ ] **Step 4: Verify compilation**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/
git commit -m "add panel data, palette list, and shared types"
```

---

## Task 4: Port styles.css → app/globals.css

**Files:**
- Modify: `app/globals.css` (replace existing)

The handoff `design_handoff_ml_portfolio/styles.css` is 1067 lines and is the authoritative source for all visual rules (palettes, layout, animations). It is plain CSS and ports verbatim, with two small adjustments below.

- [ ] **Step 1: Copy the file verbatim**

```bash
cp design_handoff_ml_portfolio/styles.css app/globals.css
```

- [ ] **Step 2: Replace any hard-coded `font-family` declarations to use the next/font CSS variables**

Open `app/globals.css`. Find every reference to `'Archivo Black'`, `'Space Grotesk'`, `'Space Mono'` font-family strings. Replace with `var(--font-display)`, `var(--font-body)`, `var(--font-mono)`. The handoff `:root` block probably already does this — verify, leave if already correct.

Also remove any `@import` of Google Fonts (next/font handles loading).

- [ ] **Step 3: Confirm `.world` has NO default `transition` rule**

Search `app/globals.css` for `.world`. The rule should set `transform-style: preserve-3d`, `position: relative`, etc. — but MUST NOT include `transition: ...`. If one is there, delete it. (See spec §13 gotcha.)

- [ ] **Step 4: Verify**

```bash
pnpm dev
```

Open http://localhost:3000. Expected: page background turns dark purple (`#0a0418`), even though the home content is still the Next.js starter. No CSS parse errors in console.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "port handoff styles.css to globals.css with next/font variables"
```

---

## Task 5: Tweaks context + persistence

**Files:**
- Create: `context/TweaksContext.tsx`
- Create: `hooks/useTweaks.ts`

- [ ] **Step 1: Create `context/TweaksContext.tsx`**

```tsx
"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_TWEAKS, type Tweaks } from "@/lib/types";

const STORAGE_KEY = "portfolio.tweaks";

type Ctx = {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;
};

export const TweaksContext = createContext<Ctx | null>(null);

export function TweaksProvider({ children }: { children: ReactNode }) {
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULT_TWEAKS);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Tweaks>;
        setTweaks((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // localStorage disabled / private mode — fall back to defaults
    }
  }, []);

  // Persist on every change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tweaks));
    } catch {
      // ignore
    }
  }, [tweaks]);

  // Apply palette to <body data-palette>
  useEffect(() => {
    document.body.dataset.palette = tweaks.palette;
  }, [tweaks.palette]);

  const setTweak: Ctx["setTweak"] = (key, value) => {
    setTweaks((prev) => ({ ...prev, [key]: value }));
  };

  return <TweaksContext.Provider value={{ tweaks, setTweak }}>{children}</TweaksContext.Provider>;
}
```

- [ ] **Step 2: Create `hooks/useTweaks.ts`**

```ts
"use client";

import { useContext } from "react";
import { TweaksContext } from "@/context/TweaksContext";

export function useTweaks() {
  const ctx = useContext(TweaksContext);
  if (!ctx) throw new Error("useTweaks must be used inside <TweaksProvider>");
  return ctx;
}
```

- [ ] **Step 3: Wire `TweaksProvider` into `app/layout.tsx`**

In `app/layout.tsx`, import `TweaksProvider` and wrap `{children}`:

```tsx
import { TweaksProvider } from "@/context/TweaksContext";
// ... existing imports
```

Change the body to:

```tsx
<body data-palette="purple">
  <TweaksProvider>{children}</TweaksProvider>
</body>
```

- [ ] **Step 4: Verify**

```bash
pnpm dev
```

Open http://localhost:3000. Open devtools → Application → Local Storage. Expected: nothing yet (defaults haven't been persisted because nothing has triggered a write — that's fine; first write happens after a setTweak call). No console errors.

- [ ] **Step 5: Commit**

```bash
git add context/ hooks/ app/layout.tsx
git commit -m "add TweaksContext provider and useTweaks hook with localStorage persistence"
```

---

## Task 6: Stage skeleton + page mount

**Files:**
- Create: `components/Stage.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/Stage.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { useTweaks } from "@/hooks/useTweaks";
import type { View } from "@/lib/types";

export default function Stage() {
  const { tweaks } = useTweaks();
  const [view, setView] = useState<View>("home");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [keyboardIdx, setKeyboardIdx] = useState<number>(0);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current.tx = e.clientX / rect.width - 0.5;
    mouseRef.current.ty = e.clientY / rect.height - 0.5;
  };

  return (
    <div className="app" onMouseMove={onMouseMove}>
      <div className="bg-grid" />
      <div className="bg-vignette" />

      <div className={`scene ${view !== "home" && view !== "flying" ? "hidden" : ""}`}>
        <div className="scene-scaler">
          <div ref={worldRef} className="world">
            {/* Hero, Decor, Panels go here in later tasks */}
            <div style={{ color: "var(--fg)", padding: 40 }}>STAGE SHELL</div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

(The unused state setters and refs are intentional — later tasks consume them.)

- [ ] **Step 2: Replace `app/page.tsx`**

```tsx
import Stage from "@/components/Stage";

export default function Home() {
  return <Stage />;
}
```

- [ ] **Step 3: Verify**

```bash
pnpm dev
```

Open http://localhost:3000. Expected: dark purple background, text "STAGE SHELL" visible somewhere on the page. No console errors. No hydration warnings.

- [ ] **Step 4: Commit**

```bash
git add components/Stage.tsx app/page.tsx
git commit -m "add Stage client component skeleton mounted on home page"
```

---

## Task 7: Hero component

**Files:**
- Create: `components/Hero.tsx`
- Modify: `components/Stage.tsx`

- [ ] **Step 1: Create `components/Hero.tsx`**

Translated from `design_handoff_ml_portfolio/app.jsx:92-105`:

```tsx
type Props = { fading: boolean };

export default function Hero({ fading }: Props) {
  return (
    <div className={`hero ${fading ? "fading" : ""}`}>
      <div className="eyebrow">NOW PLAYING</div>
      <h1 className="name">CHONG<br />MING&nbsp;LI</h1>
      <div className="tag">
        DEV <span className="sep">×</span> DATA SCIENTIST
      </div>
      <div className="cta">
        <span className="chev">▶</span> SELECT A STAGE
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Mount in Stage**

In `components/Stage.tsx`, import and render Hero inside `.world`, replacing the placeholder div:

```tsx
import Hero from "./Hero";
// ...
<div ref={worldRef} className="world">
  <Hero fading={view !== "home"} />
</div>
```

- [ ] **Step 3: Verify**

`pnpm dev` → http://localhost:3000. Expected: "NOW PLAYING" eyebrow, large italic "CHONG MING LI" name in two lines, "DEV × DATA SCIENTIST" tag, blinking "▶ SELECT A STAGE" CTA centered. Cyan/purple accents match palette.

- [ ] **Step 4: Commit**

```bash
git add components/Hero.tsx components/Stage.tsx
git commit -m "add Hero component (eyebrow, name, tag, CTA)"
```

---

## Task 8: Decor component (background stroked words)

**Files:**
- Create: `components/Decor.tsx`
- Modify: `components/Stage.tsx`

- [ ] **Step 1: Create `components/Decor.tsx`**

Translated from `design_handoff_ml_portfolio/app.jsx:107-111` + the inline render at 285-287:

```tsx
const DECO = [
  { text: "PLAY·PLAY·PLAY",     t: "translate(-50%, -50%) translate3d(-820px, -380px, -500px) rotateY(28deg)" },
  { text: "READY · START · GO", t: "translate(-50%, -50%) translate3d(880px, 360px, -500px) rotateY(-30deg)" },
  { text: "STAGE · SELECT",     t: "translate(-50%, -50%) translate3d(-720px, 460px, -550px) rotateY(22deg) rotateX(8deg)" },
];

export default function Decor() {
  return (
    <>
      {DECO.map((d) => (
        <div key={d.text} className="deco" style={{ transform: d.t }}>
          {d.text}
        </div>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Render Decor inside `.world` before Hero**

In `components/Stage.tsx`:

```tsx
import Decor from "./Decor";
// ...
<div ref={worldRef} className="world">
  <Decor />
  <Hero fading={view !== "home"} />
</div>
```

- [ ] **Step 3: Verify**

http://localhost:3000 — three large stroked words ("PLAY·PLAY·PLAY", "READY · START · GO", "STAGE · SELECT") visible faintly behind the hero at large rotation angles.

- [ ] **Step 4: Commit**

```bash
git add components/Decor.tsx components/Stage.tsx
git commit -m "add Decor background stroked-word layer"
```

---

## Task 9: Panel component

**Files:**
- Create: `components/Panel.tsx`
- Modify: `components/Stage.tsx`

- [ ] **Step 1: Create `components/Panel.tsx`**

Translated from `design_handoff_ml_portfolio/app.jsx:61-90`:

```tsx
"use client";

import type { PanelData } from "@/lib/types";

type Props = {
  panel: PanelData;
  focused: boolean;
  onActivate: (panel: PanelData) => void;
  onHover: () => void;
};

export default function Panel({ panel, focused, onActivate, onHover }: Props) {
  return (
    <div
      className="panel"
      style={{
        transform: `translate3d(${panel.x}px, ${panel.y}px, ${panel.z}px) rotateY(${panel.ry}deg) rotateX(${panel.rx}deg)`,
      }}
      onMouseEnter={onHover}
      onClick={() => onActivate(panel)}
    >
      <div
        className="panel-card"
        style={{
          animationDelay: panel.delay + "s",
          outline: focused ? "2px solid var(--accent-2)" : "none",
          outlineOffset: focused ? "6px" : "0",
        }}
      >
        <div className="panel-stage">{panel.num}</div>
        <span className="panel-corner tl" />
        <span className="panel-corner tr" />
        <span className="panel-corner bl" />
        <span className="panel-corner br" />
        <div className="panel-num">STAGE {panel.num}</div>
        <div className="panel-glyph">{panel.glyph}</div>
        <div className="panel-img">[ {panel.img.toUpperCase()} ]</div>
        <div className="panel-label">
          <div className="big">{panel.label}</div>
          <div className="sub">
            <span>{panel.sub}</span>
            <span className="arrow">▶</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Render 4 panels in Stage**

In `components/Stage.tsx`:

```tsx
import Panel from "./Panel";
import { PANELS } from "@/lib/panels";
// ...
<div ref={worldRef} className="world">
  <Decor />
  <Hero fading={view !== "home"} />
  {PANELS.map((p, i) => (
    <Panel
      key={p.id}
      panel={p}
      focused={view === "home" && (focusedId === p.id || keyboardIdx === i)}
      onActivate={() => { /* wired in Task 15 */ }}
      onHover={() => setFocusedId(p.id)}
    />
  ))}
</div>
```

- [ ] **Step 3: Verify**

http://localhost:3000 — 4 panels at the 4 quadrants (About TL, Projects TR, Skills BL, Contact BR). Cards float (bob up/down) with staggered delays. Hover: card border brightens, glow grows, lifts. Focused outline appears when hovering. Glyphs ◆ ▲ ★ ◉ visible.

- [ ] **Step 4: Commit**

```bash
git add components/Panel.tsx components/Stage.tsx
git commit -m "add Panel component and render 4 stage-select panels in 3D space"
```

---

## Task 10: HUD component (4 corner chrome)

**Files:**
- Create: `components/Hud.tsx`
- Modify: `components/Stage.tsx`

- [ ] **Step 1: Create `components/Hud.tsx`**

Translated from `design_handoff_ml_portfolio/app.jsx:20-59`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { TICKER_BITS } from "@/lib/panels";

type Props = { focused: boolean };

export default function Hud({ focused }: Props) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hud">
      <div className="corner tl">
        <span className="dot" />
        <span className="bracket">MAIN MENU</span>
        <span>· STAGE SELECT</span>
      </div>
      <div className="corner tr">
        <span>PLAYER · PENGY</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span>LV. {String(tick + 27).padStart(2, "0")}</span>
      </div>
      <div className="corner bl">
        <span className="kbd">←</span>
        <span className="kbd">→</span>
        <span className="kbd">↑</span>
        <span className="kbd">↓</span>
        <span style={{ opacity: 0.55 }}>MOVE</span>
        <span style={{ opacity: 0.35 }}>·</span>
        <span className="kbd">↵</span>
        <span style={{ opacity: 0.55 }}>CONFIRM</span>
        <span style={{ opacity: 0.35 }}>·</span>
        <span className="kbd">ESC</span>
        <span style={{ opacity: 0.55 }}>BACK</span>
      </div>
      <div className="corner br ticker">
        {TICKER_BITS.map((b, i) => (
          <span key={b} style={{ opacity: tick % TICKER_BITS.length === i ? 1 : 0.4 }}>
            {b}
          </span>
        ))}
      </div>
      <div className={`crosshair ${focused ? "active" : ""}`} />
    </div>
  );
}
```

- [ ] **Step 2: Render Hud in Stage (outside .scene, after .scene)**

In `components/Stage.tsx`:

```tsx
import Hud from "./Hud";
// ...
return (
  <div className="app" onMouseMove={onMouseMove}>
    <div className="bg-grid" />
    <div className="bg-vignette" />
    <div className={`scene ${view !== "home" && view !== "flying" ? "hidden" : ""}`}>
      {/* ... */}
    </div>
    <Hud focused={focusedId !== null && view === "home"} />
  </div>
);
```

- [ ] **Step 3: Verify**

http://localhost:3000:
- Top-left: pulsing dot + "MAIN MENU · STAGE SELECT".
- Top-right: "PLAYER · PENGY | LV. 27" — level ticks upward every 700ms.
- Bottom-left: keyboard chips with labels.
- Bottom-right: ticker (STARS / COINS / HI) — highlight rotates every 700ms.

- [ ] **Step 4: Commit**

```bash
git add components/Hud.tsx components/Stage.tsx
git commit -m "add HUD corner chrome with live ticker and level counter"
```

---

## Task 11: useResponsiveScale hook

**Files:**
- Create: `hooks/useResponsiveScale.ts`
- Modify: `components/Stage.tsx`

- [ ] **Step 1: Create `hooks/useResponsiveScale.ts`**

Translated from `design_handoff_ml_portfolio/app.jsx:154-165`:

```ts
"use client";

import { useEffect } from "react";

export function useResponsiveScale() {
  useEffect(() => {
    const update = () => {
      const sX = (window.innerWidth - 40) / 1300;
      const sY = (window.innerHeight - 40) / 940;
      const s = Math.min(1, Math.max(0.4, Math.min(sX, sY)));
      document.documentElement.style.setProperty("--world-scale", String(s));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
}
```

- [ ] **Step 2: Call from Stage**

In `components/Stage.tsx`, inside the component body:

```tsx
import { useResponsiveScale } from "@/hooks/useResponsiveScale";
// ...
export default function Stage() {
  useResponsiveScale();
  // ... rest
}
```

- [ ] **Step 3: Verify**

http://localhost:3000. Resize the browser from 1400px wide down to 600px. Expected: the entire 3D scene scales down (panels move closer together, hero shrinks), bottoming out at 40% scale. HUD corners stay at the viewport edges (not scaled — they're outside `.scene-scaler`).

- [ ] **Step 4: Commit**

```bash
git add hooks/useResponsiveScale.ts components/Stage.tsx
git commit -m "add useResponsiveScale hook to size the 3D scene to viewport"
```

---

## Task 12: useParallax hook (mouse-driven world tilt)

**Files:**
- Create: `hooks/useParallax.ts`
- Modify: `components/Stage.tsx`

- [ ] **Step 1: Create `hooks/useParallax.ts`**

Translated from `design_handoff_ml_portfolio/app.jsx:168-183`:

```ts
"use client";

import { useEffect, type RefObject } from "react";
import type { View } from "@/lib/types";

type MouseRef = { x: number; y: number; tx: number; ty: number };

export function useParallax(
  worldRef: RefObject<HTMLDivElement | null>,
  mouseRef: RefObject<MouseRef>,
  view: View,
  motionIntensity: number,
) {
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const m = mouseRef.current;
      m.x += (m.tx - m.x) * 0.08;
      m.y += (m.ty - m.y) * 0.08;
      if (view === "home" && worldRef.current) {
        const k = motionIntensity / 10;
        worldRef.current.style.transform =
          `rotateX(${-m.y * 12 * k}deg) rotateY(${m.x * 18 * k}deg) translate3d(${m.x * 60 * k}px, ${m.y * 40 * k}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [worldRef, mouseRef, view, motionIntensity]);
}
```

- [ ] **Step 2: Call from Stage**

In `components/Stage.tsx`:

```tsx
import { useParallax } from "@/hooks/useParallax";
// ...
export default function Stage() {
  useResponsiveScale();
  const { tweaks } = useTweaks();
  const [view, setView] = useState<View>("home");
  // ... refs ...
  useParallax(worldRef, mouseRef, view, tweaks.motionIntensity);
  // ...
}
```

- [ ] **Step 3: Verify**

http://localhost:3000. Move mouse around the viewport. Expected: world (hero + panels + decor) tilts smoothly toward cursor. NO lag, NO jitter. If you see lag, the `.world` CSS rule has a leftover `transition` — fix `app/globals.css`.

- [ ] **Step 4: Commit**

```bash
git add hooks/useParallax.ts components/Stage.tsx
git commit -m "add mouse parallax RAF loop for the 3D scene"
```

---

## Task 13: Background overlays (sunburst, scanlines, grain)

**Files:**
- Create: `components/Background.tsx`
- Modify: `components/Stage.tsx`

- [ ] **Step 1: Create `components/Background.tsx`**

```tsx
"use client";

import { useTweaks } from "@/hooks/useTweaks";

export default function Background() {
  const { tweaks } = useTweaks();
  return (
    <>
      {tweaks.sunburst && <div className="bg-burst" />}
      {tweaks.sunburst && <div className="bg-burst alt" />}
      {tweaks.scanlines && <div className="bg-scanlines" />}
      {tweaks.grain && <div className="bg-noise" />}
    </>
  );
}
```

- [ ] **Step 2: Render Background in Stage**

In `components/Stage.tsx`, after `bg-grid` and `bg-vignette`:

```tsx
import Background from "./Background";
// ...
<div className="app" onMouseMove={onMouseMove}>
  <div className="bg-grid" />
  <div className="bg-vignette" />
  <Background />
  {/* ... scene, hud ... */}
</div>
```

Note: scanlines + noise also appear over the section views; for now they're under HUD. Match handoff `app.jsx:317-318` if order matters visually — those are rendered after `.section-view` so they overlay. Move the scanlines/grain to AFTER the section views container (will be added in Task 16). For now, leaving them under HUD is acceptable since no sections render yet.

- [ ] **Step 3: Verify**

http://localhost:3000. Expected: two slowly rotating sunburst gradients visible behind everything; horizontal scanlines overlay the whole screen; subtle film grain. All three are on because `DEFAULT_TWEAKS` has them true.

- [ ] **Step 4: Commit**

```bash
git add components/Background.tsx components/Stage.tsx
git commit -m "add Background overlay (sunburst + scanlines + grain)"
```

---

## Task 14: SectionShell + 4 section components

**Files:**
- Create: `components/sections/SectionShell.tsx`, `About.tsx`, `Projects.tsx`, `Skills.tsx`, `Contact.tsx`

- [ ] **Step 1: Create `components/sections/SectionShell.tsx`**

Translated from `design_handoff_ml_portfolio/sections.jsx:3-15`:

```tsx
import type { ReactNode } from "react";

type Props = {
  num: string;
  title: string;
  ghost?: string;
  onBack: () => void;
  children: ReactNode;
};

export default function SectionShell({ num, title, ghost, onBack, children }: Props) {
  return (
    <div className="section-inner">
      {ghost && <div className="section-ghost">{ghost}</div>}
      <div className="section-head reveal">
        <div>
          <div className="meta">STAGE {num} · NOW LOADED</div>
          <h1>{title}</h1>
        </div>
        <button className="back" onClick={onBack}>◀ BACK TO MENU</button>
      </div>
      <div className="section-body">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/sections/About.tsx`**

Translated from `design_handoff_ml_portfolio/sections.jsx:17-69`:

```tsx
import SectionShell from "./SectionShell";

export default function About({ onBack }: { onBack: () => void }) {
  return (
    <SectionShell num="01" title="CHARACTER" ghost="WHO" onBack={onBack}>
      <div className="reveal d1">
        <div className="about-bio">
          <p>
            <span className="dim">// player profile</span>
            Hi, I&rsquo;m <span className="accent">Chong Ming Li</span> — a Software Developer
            and Data Scientist who likes turning research into things people actually use.
            I build production systems that move at the speed of research, and research that
            survives contact with production.
          </p>
          <p>
            <span className="dim">// current quest</span>
            Making models that are small, fast, and explainable — in that order.
            Lately I&rsquo;ve been deep in retrieval systems, time-series forecasting,
            and the very unglamorous plumbing that makes ML actually ship.
          </p>
          <p>
            <span className="dim">// loadout</span>
            The best code is the code you didn&rsquo;t need to write. The best model is the
            one you didn&rsquo;t need to deploy. Ruthlessly delete; carefully add.
          </p>
        </div>
        <div className="about-stats" style={{ marginTop: 36 }}>
          <div className="stat-card">
            <div className="label">Models Shipped</div>
            <div className="value">12+</div>
            <div className="unit">in production</div>
          </div>
          <div className="stat-card">
            <div className="label">XP · Years Coding</div>
            <div className="value">07</div>
            <div className="unit">and counting</div>
          </div>
          <div className="stat-card">
            <div className="label">Coffee / Day</div>
            <div className="value">03</div>
            <div className="unit">averaged · cal.</div>
          </div>
          <div className="stat-card">
            <div className="label">Open Source</div>
            <div className="value">∞</div>
            <div className="unit">always shipping</div>
          </div>
        </div>
      </div>
      <div className="reveal d2">
        <div className="headshot">
          <span className="placeholder-label">[ HEADSHOT · 4:5 ]</span>
        </div>
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 3: Create `components/sections/Projects.tsx`**

Translated from `design_handoff_ml_portfolio/sections.jsx:71-108`:

```tsx
import SectionShell from "./SectionShell";

const PROJECTS = [
  {
    num: "01",
    title: "NEURAL FORECAST ENGINE",
    desc: "A time-series forecasting pipeline for retail demand. Transformer + classical ensemble running on streaming data — sub-100ms p99 latency across 40k SKUs. Boss fight: making it explainable to non-ML folks.",
    tags: ["PyTorch", "Ray", "Kafka", "PRODUCTION"],
    img: "cover art · 16:10",
  },
  {
    num: "02",
    title: "SEMANTIC SEARCH STACK",
    desc: "End-to-end retrieval system: custom embeddings, ANN index, re-ranker. Open source, BYO corpus. 5× recall over BM25 on internal benchmark. Side-quest: shipping it as a tiny single-binary install.",
    tags: ["Transformers", "FAISS", "FastAPI", "OSS"],
    img: "cover art · 16:10",
  },
];

export default function Projects({ onBack }: { onBack: () => void }) {
  return (
    <SectionShell num="02" title="STAGES" ghost="WORK" onBack={onBack}>
      <div className="projects-grid">
        {PROJECTS.map((p, i) => (
          <div key={p.num} className={`project-card reveal d${i + 1}`}>
            <div className="project-img">
              <span className="pl-tag">[ {p.img.toUpperCase()} ]</span>
            </div>
            <div className="project-body">
              <div className="project-num">STAGE {p.num} · CLEARED</div>
              <h3 className="project-title">{p.title}</h3>
              <p className="project-desc">{p.desc}</p>
              <div className="project-tags">
                {p.tags.map((tg) => <span key={tg} className="tag">{tg}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 4: Create `components/sections/Skills.tsx`**

Translated from `design_handoff_ml_portfolio/sections.jsx:110-152`:

```tsx
import SectionShell from "./SectionShell";

const SKILLS = [
  {
    name: "ML / RESEARCH",
    items: [
      ["PyTorch", 95], ["Transformers", 90], ["Diffusion Models", 75],
      ["Reinforcement Learning", 65], ["Bayesian Methods", 70],
    ] as [string, number][],
  },
  {
    name: "ENGINEERING",
    items: [
      ["Python", 98], ["TypeScript", 85], ["Go", 70],
      ["Rust", 55], ["SQL", 88],
    ] as [string, number][],
  },
  {
    name: "INFRASTRUCTURE",
    items: [
      ["Kubernetes", 80], ["Ray / Spark", 85], ["AWS / GCP", 82],
      ["MLflow / W&B", 88], ["Terraform", 65],
    ] as [string, number][],
  },
];

export default function Skills({ onBack }: { onBack: () => void }) {
  return (
    <SectionShell num="03" title="ABILITIES" ghost="POW" onBack={onBack}>
      <div className="skills-grid">
        {SKILLS.map((cat, i) => (
          <div key={cat.name} className={`skill-cat reveal d${i + 1}`}>
            <h3>{cat.name}</h3>
            <ul>
              {cat.items.map(([n, lvl]) => (
                <li key={n}>
                  <span>{n}</span>
                  <span className="bar" style={{ "--lvl": lvl + "%" } as React.CSSProperties} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 5: Create `components/sections/Contact.tsx`**

Translated from `design_handoff_ml_portfolio/sections.jsx:154-191`:

```tsx
import SectionShell from "./SectionShell";

export default function Contact({ onBack }: { onBack: () => void }) {
  return (
    <SectionShell num="04" title="CONNECT" ghost="HI!" onBack={onBack}>
      <div className="contact-body">
        <div className="contact-lines reveal d1">
          <a className="contact-row" href="mailto:hello@chongming.li">
            <span className="k">▶ EMAIL</span>
            <span className="v">hello@chongming.li</span>
          </a>
          <a className="contact-row" href="#">
            <span className="k">▶ GITHUB</span>
            <span className="v">@chongmingli</span>
          </a>
          <a className="contact-row" href="#">
            <span className="k">▶ LINKEDIN</span>
            <span className="v">/in/chongmingli</span>
          </a>
          <a className="contact-row" href="#">
            <span className="k">▶ TWITTER / X</span>
            <span className="v">@cm_li</span>
          </a>
          <div className="contact-row">
            <span className="k">◆ LOCATION</span>
            <span className="v">REMOTE · UTC+8</span>
          </div>
        </div>
        <div className="contact-cta reveal d2">
          <div className="big">PRESS START.<br />LET&rsquo;S BUILD<br />SOMETHING.</div>
          <div className="small">
            Open to senior IC roles, research collaborations, and short-engagement
            consulting on ML infra &amp; applied research. Replies in &lt; 24h.
          </div>
          <button onClick={() => { window.location.href = "mailto:hello@chongming.li"; }}>
            ▶ SEND TRANSMISSION
          </button>
        </div>
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 6: Verify compilation**

```bash
pnpm tsc --noEmit
```

Expected: no errors. (Sections aren't rendered anywhere yet — next task.)

- [ ] **Step 7: Commit**

```bash
git add components/sections/
git commit -m "add SectionShell and 4 section components with placeholder content"
```

---

## Task 15: Wire section view rendering into Stage

**Files:**
- Modify: `components/Stage.tsx`

- [ ] **Step 1: Import sections and render with opacity-based visibility**

In `components/Stage.tsx`, add at the top:

```tsx
import About from "./sections/About";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import Contact from "./sections/Contact";
```

Add a `back` callback (temporary — will be replaced in Task 17):

```tsx
const back = () => {
  setView("home");
  setFocusedId(null);
};
```

Add the section views after `.scene` and before `<Hud />`:

```tsx
<div className={`section-view ${view === "about" ? "visible" : ""}`}>
  {view === "about" && <About onBack={back} />}
</div>
<div className={`section-view ${view === "projects" ? "visible" : ""}`}>
  {view === "projects" && <Projects onBack={back} />}
</div>
<div className={`section-view ${view === "skills" ? "visible" : ""}`}>
  {view === "skills" && <Skills onBack={back} />}
</div>
<div className={`section-view ${view === "contact" ? "visible" : ""}`}>
  {view === "contact" && <Contact onBack={back} />}
</div>
```

(Per spec gotcha §13: section-view uses `opacity` + `pointer-events: none`, NOT `display: none`. The handoff CSS already does this — just don't add `display:none` styles.)

- [ ] **Step 2: Temporarily wire panel onActivate to setView**

In `components/Stage.tsx`, change the Panel `onActivate` prop to:

```tsx
onActivate={(p) => setView(p.id)}
```

(Will be replaced with proper fly transition in Task 17.)

- [ ] **Step 3: Move scanlines/grain to overlay everything**

Move `<Background />` OR restructure: leave `bg-grid`, `bg-vignette`, `bg-burst` early, but put `bg-scanlines` and `bg-noise` AFTER the section views. Easiest: split into `<BackgroundBack />` (grid/vignette/burst) and `<BackgroundFront />` (scanlines/noise). For simplicity, just inline the scanlines/noise here instead of using Background for them.

Update `components/Background.tsx` to only render sunburst:

```tsx
"use client";
import { useTweaks } from "@/hooks/useTweaks";

export function BackgroundBurst() {
  const { tweaks } = useTweaks();
  if (!tweaks.sunburst) return null;
  return (<>
    <div className="bg-burst" />
    <div className="bg-burst alt" />
  </>);
}

export function BackgroundFx() {
  const { tweaks } = useTweaks();
  return (<>
    {tweaks.scanlines && <div className="bg-scanlines" />}
    {tweaks.grain && <div className="bg-noise" />}
  </>);
}
```

In `components/Stage.tsx`, replace `<Background />` with `<BackgroundBurst />` after `bg-vignette`, and add `<BackgroundFx />` after the four `<div className="section-view">` blocks.

- [ ] **Step 4: Verify**

http://localhost:3000. Click each panel. Expected: section view fades in over the scene (instant swap for now, smooth opacity transition due to CSS). Click "◀ BACK TO MENU" → returns to home. Each section renders correctly:
- About: bio + 2×2 stat grid + headshot placeholder
- Projects: 2-col cards
- Skills: 3-col grid with progress bars
- Contact: contact rows + CTA card

Reveal animations stagger (d1 then d2 etc.).

- [ ] **Step 5: Commit**

```bash
git add components/Stage.tsx components/Background.tsx
git commit -m "wire section views with opacity-based visibility and back button"
```

---

## Task 16: FxOverlays component (flash + streak)

**Files:**
- Create: `components/FxOverlays.tsx`
- Modify: `components/Stage.tsx`

- [ ] **Step 1: Create `components/FxOverlays.tsx`**

```tsx
import { forwardRef } from "react";

export type FxRefs = {
  flash: HTMLDivElement | null;
  streak: HTMLDivElement | null;
};

const FxOverlays = forwardRef<FxRefs>((_, ref) => {
  return (
    <>
      <div
        className="streak"
        ref={(el) => {
          if (ref && typeof ref === "object") (ref.current ??= { flash: null, streak: null }).streak = el;
        }}
      />
      <div
        className="flash"
        ref={(el) => {
          if (ref && typeof ref === "object") (ref.current ??= { flash: null, streak: null }).flash = el;
        }}
      />
    </>
  );
});
FxOverlays.displayName = "FxOverlays";
export default FxOverlays;
```

- [ ] **Step 2: Mount in Stage with a ref**

In `components/Stage.tsx`:

```tsx
import FxOverlays, { type FxRefs } from "./FxOverlays";
// ...
const fxRef = useRef<FxRefs>({ flash: null, streak: null });
// ...
// Render BEFORE BackgroundFx (so scanlines/noise sit on top):
<FxOverlays ref={fxRef} />
<BackgroundFx />
```

- [ ] **Step 3: Verify**

http://localhost:3000. Inspect DOM. Expected: empty `<div class="streak">` and `<div class="flash">` elements present. Nothing visible yet (no animation triggered).

- [ ] **Step 4: Commit**

```bash
git add components/FxOverlays.tsx components/Stage.tsx
git commit -m "add flash and streak overlay placeholders for fly transition"
```

---

## Task 17: useFlyTransition (fly + back)

**Files:**
- Create: `hooks/useFlyTransition.ts`
- Modify: `components/Stage.tsx`

- [ ] **Step 1: Create `hooks/useFlyTransition.ts`**

Translated from `design_handoff_ml_portfolio/app.jsx:191-241`. Audio calls are stubbed for now (passed in via callback); wired in Task 19.

```ts
"use client";

import { useCallback, type RefObject } from "react";
import type { PanelData, View } from "@/lib/types";
import type { FxRefs } from "@/components/FxOverlays";

type Args = {
  view: View;
  setView: (v: View) => void;
  setFocusedId: (id: string | null) => void;
  worldRef: RefObject<HTMLDivElement | null>;
  fxRef: RefObject<FxRefs>;
  motionIntensity: number;
  onFlyStart?: (intensity: number) => void;
  onFlyEnd?: () => void;
  onBackStart?: () => void;
};

export function useFlyTransition({
  view, setView, setFocusedId, worldRef, fxRef, motionIntensity,
  onFlyStart, onFlyEnd, onBackStart,
}: Args) {
  const fly = useCallback((panel: PanelData) => {
    if (view !== "home") return;
    onFlyStart?.(motionIntensity);

    setView("flying");
    setFocusedId(panel.id);

    const world = worldRef.current;
    if (world) {
      const intensity = motionIntensity;
      const duration = 850 - intensity * 15;
      world.classList.add("cinematic");
      world.style.transition = `transform ${duration}ms cubic-bezier(0.7, 0, 0.15, 1)`;
      const zPush = 700 + intensity * 50;
      const ry = -panel.ry * (0.5 + intensity / 20);
      const rx = -panel.rx * (0.5 + intensity / 20);
      world.style.transform =
        `translate3d(${-panel.x}px, ${-panel.y}px, ${zPush}px) rotateY(${ry}deg) rotateX(${rx}deg)`;
    }

    const { flash, streak } = fxRef.current;
    if (flash) { flash.classList.remove("fire"); void flash.offsetWidth; flash.classList.add("fire"); }
    if (streak) { streak.classList.remove("fire"); void streak.offsetWidth; streak.classList.add("fire"); }

    setTimeout(() => {
      onFlyEnd?.();
      setView(panel.id);
    }, 700);
  }, [view, motionIntensity, setView, setFocusedId, worldRef, fxRef, onFlyStart, onFlyEnd]);

  const back = useCallback(() => {
    if (view === "home" || view === "flying") return;
    onBackStart?.();
    setView("home");
    setFocusedId(null);
    const world = worldRef.current;
    if (world) {
      world.classList.add("cinematic");
      world.style.transition = "transform 800ms cubic-bezier(0.2, 0.7, 0.2, 1)";
      world.style.transform = "translate3d(0,0,0)";
      setTimeout(() => {
        if (world) {
          world.classList.remove("cinematic");
          world.style.transition = "";
        }
      }, 850);
    }
  }, [view, setView, setFocusedId, worldRef, onBackStart]);

  return { fly, back };
}
```

- [ ] **Step 2: Wire into Stage**

In `components/Stage.tsx`, replace the temporary `back` lambda and panel onActivate:

```tsx
import { useFlyTransition } from "@/hooks/useFlyTransition";
// ...
const { fly, back } = useFlyTransition({
  view, setView, setFocusedId, worldRef, fxRef,
  motionIntensity: tweaks.motionIntensity,
});

// Panel:
<Panel
  key={p.id}
  panel={p}
  focused={view === "home" && (focusedId === p.id || keyboardIdx === i)}
  onActivate={fly}
  onHover={() => setFocusedId(p.id)}
/>

// Sections: pass `back` to each (already wired, just confirm).
```

- [ ] **Step 3: Verify**

http://localhost:3000. Click a panel. Expected:
- Flash overlay flares (accent color flash, 700ms).
- Streak overlay sweeps horizontally.
- World transforms — flies through panel position.
- After 700ms, section view fades in.
- Click "BACK TO MENU" → world flies back to identity, parallax resumes smoothly (no lag after the 850ms settle).

If parallax is laggy after back, the inline transition isn't being cleared — verify Step 1 setTimeout fires.

- [ ] **Step 4: Commit**

```bash
git add hooks/useFlyTransition.ts components/Stage.tsx
git commit -m "add fly-through and back transitions with FX overlay firing"
```

---

## Task 18: Keyboard navigation

**Files:**
- Create: `hooks/useKeyboardNav.ts`
- Modify: `components/Stage.tsx`

- [ ] **Step 1: Create `hooks/useKeyboardNav.ts`**

Translated from `design_handoff_ml_portfolio/app.jsx:244-266`:

```ts
"use client";

import { useEffect } from "react";
import { PANELS } from "@/lib/panels";
import type { PanelData, View } from "@/lib/types";

type Args = {
  view: View;
  keyboardIdx: number;
  setKeyboardIdx: (i: number) => void;
  fly: (panel: PanelData) => void;
  back: () => void;
  onMove?: () => void;
};

export function useKeyboardNav({ view, keyboardIdx, setKeyboardIdx, fly, back, onMove }: Args) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (view !== "home" && view !== "flying") {
        if (e.key === "Escape") back();
        return;
      }
      if (view === "flying") return;

      // Quadrant model: 0=TL, 1=TR, 2=BL, 3=BR
      let idx = keyboardIdx;
      if (e.key === "ArrowRight") idx = idx % 2 === 0 ? idx + 1 : idx;
      else if (e.key === "ArrowLeft") idx = idx % 2 === 1 ? idx - 1 : idx;
      else if (e.key === "ArrowDown") idx = idx < 2 ? idx + 2 : idx;
      else if (e.key === "ArrowUp") idx = idx >= 2 ? idx - 2 : idx;
      else if (e.key === "Enter" || e.key === " ") { fly(PANELS[idx]); return; }
      else return;

      if (idx !== keyboardIdx) {
        setKeyboardIdx(idx);
        onMove?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, keyboardIdx, setKeyboardIdx, fly, back, onMove]);
}
```

- [ ] **Step 2: Wire into Stage**

In `components/Stage.tsx`:

```tsx
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
// ...
useKeyboardNav({ view, keyboardIdx, setKeyboardIdx, fly, back });
```

- [ ] **Step 3: Verify**

http://localhost:3000. Click body once to focus window. Use arrow keys: focus outline moves between panels in quadrant pattern (right → TR, down → BR, etc.). Press Enter on the focused panel → fly triggers. Inside a section, press Esc → back triggers.

- [ ] **Step 4: Commit**

```bash
git add hooks/useKeyboardNav.ts components/Stage.tsx
git commit -m "add keyboard navigation with arrow + enter + esc"
```

---

## Task 19: Audio module + useAudio hook + wire into transitions

**Files:**
- Create: `lib/audio.ts`
- Create: `hooks/useAudio.ts`
- Modify: `components/Stage.tsx`

- [ ] **Step 1: Create `lib/audio.ts`**

Ported from `design_handoff_ml_portfolio/audio.js` (102 lines) as a module instead of a window global:

```ts
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
  if (ctx.state === "suspended") ctx.resume();
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
```

- [ ] **Step 2: Create `hooks/useAudio.ts`**

```ts
"use client";

import { useEffect, useRef } from "react";
import { init, setEnabled } from "@/lib/audio";

export function useAudio(soundEnabled: boolean) {
  const ready = useRef(false);

  // Reflect tweak into module flag
  useEffect(() => { setEnabled(soundEnabled); }, [soundEnabled]);

  // Init AudioContext on first user gesture
  useEffect(() => {
    const handler = () => {
      if (!ready.current) {
        init();
        ready.current = true;
      }
    };
    window.addEventListener("click", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);
}
```

- [ ] **Step 3: Wire into Stage**

In `components/Stage.tsx`:

```tsx
import { useAudio } from "@/hooks/useAudio";
import { whoosh, click, hover as hoverSfx, thud } from "@/lib/audio";
// ...
useAudio(tweaks.soundEnabled);

const { fly, back } = useFlyTransition({
  view, setView, setFocusedId, worldRef, fxRef,
  motionIntensity: tweaks.motionIntensity,
  onFlyStart: (i) => { whoosh(0.5 + i / 14); click(900); },
  onFlyEnd: () => thud(),
  onBackStart: () => { click(440); whoosh(0.4); },
});

useKeyboardNav({
  view, keyboardIdx, setKeyboardIdx, fly, back,
  onMove: () => hoverSfx(),
});

// Panel onHover plays hover too:
onHover={() => { hoverSfx(); setFocusedId(p.id); }}
```

- [ ] **Step 4: Verify**

http://localhost:3000. Click anywhere first to initialize audio. Then:
- Hover a panel → soft beep.
- Arrow keys → soft beep on each move.
- Click panel → whoosh + click on entry, thud at end.
- Click back → click + soft whoosh.

If silent: check browser tab isn't muted. Check `tweaks.soundEnabled` is true in devtools React DevTools → TweaksProvider.

- [ ] **Step 5: Commit**

```bash
git add lib/audio.ts hooks/useAudio.ts components/Stage.tsx
git commit -m "add Web Audio synth module and wire whoosh/click/hover/thud into transitions"
```

---

## Task 20: TweaksPanel UI

**Files:**
- Create: `components/TweaksPanel.tsx`
- Modify: `components/Stage.tsx`

The handoff `tweaks-panel.jsx` (568 lines) includes a host-postMessage protocol that's not relevant here. Strip it down to a floating panel toggled by a button.

- [ ] **Step 1: Create `components/TweaksPanel.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useTweaks } from "@/hooks/useTweaks";
import { PALETTE_OPTIONS } from "@/lib/palettes";
import type { PaletteName } from "@/lib/types";

export default function TweaksPanel() {
  const { tweaks, setTweak } = useTweaks();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed", right: 24, bottom: 24, zIndex: 50,
          fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em",
          padding: "8px 14px", color: "var(--accent-2)",
          background: "color-mix(in oklab, var(--bg-0) 70%, transparent)",
          border: "1px solid color-mix(in oklab, var(--accent-2) 55%, transparent)",
          textTransform: "uppercase", cursor: "pointer",
        }}
      >
        {open ? "× CLOSE" : "⚙ TWEAKS"}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Tweaks"
          style={{
            position: "fixed", right: 24, bottom: 70, zIndex: 50,
            width: 280, padding: 18,
            background: "color-mix(in oklab, var(--bg-0) 92%, transparent)",
            border: "1px solid color-mix(in oklab, var(--accent) 35%, transparent)",
            color: "var(--fg)", fontFamily: "var(--font-mono)", fontSize: 11,
            display: "flex", flexDirection: "column", gap: 14,
          }}
        >
          <Section label="LOOK" />
          <Row label="Palette">
            <select
              value={tweaks.palette}
              onChange={(e) => setTweak("palette", e.target.value as PaletteName)}
              style={selectStyle}
            >
              {PALETTE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Row>
          <Toggle label="Sunburst"   value={tweaks.sunburst}   onChange={(v) => setTweak("sunburst", v)} />
          <Toggle label="Scanlines"  value={tweaks.scanlines}  onChange={(v) => setTweak("scanlines", v)} />
          <Toggle label="Film Grain" value={tweaks.grain}      onChange={(v) => setTweak("grain", v)} />

          <Section label="MOTION" />
          <Row label={`Intensity · ${tweaks.motionIntensity}`}>
            <input
              type="range" min={1} max={10} step={1}
              value={tweaks.motionIntensity}
              onChange={(e) => setTweak("motionIntensity", Number(e.target.value))}
              style={{ flex: 1 }}
            />
          </Row>

          <Section label="AUDIO" />
          <Toggle label="UI Sounds" value={tweaks.soundEnabled} onChange={(v) => setTweak("soundEnabled", v)} />
        </div>
      )}
    </>
  );
}

const selectStyle: React.CSSProperties = {
  background: "var(--bg-0)", color: "var(--fg)",
  border: "1px solid color-mix(in oklab, var(--accent) 35%, transparent)",
  padding: "4px 8px", fontFamily: "var(--font-mono)", fontSize: 11,
};

function Section({ label }: { label: string }) {
  return <div style={{ color: "var(--accent)", letterSpacing: "0.25em", fontWeight: 700 }}>// {label}</div>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <span style={{ opacity: 0.7 }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row label={label}>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          background: value ? "var(--accent)" : "transparent",
          color: value ? "var(--bg-0)" : "var(--fg)",
          border: "1px solid color-mix(in oklab, var(--accent) 55%, transparent)",
          padding: "3px 10px", fontFamily: "var(--font-mono)", fontSize: 10,
          cursor: "pointer", letterSpacing: "0.1em",
        }}
      >
        {value ? "ON" : "OFF"}
      </button>
    </Row>
  );
}
```

- [ ] **Step 2: Mount in Stage**

In `components/Stage.tsx`, add at the end of the returned JSX (before closing `</div>`):

```tsx
import TweaksPanel from "./TweaksPanel";
// ...
<TweaksPanel />
```

- [ ] **Step 3: Verify**

http://localhost:3000. Bottom-right: "⚙ TWEAKS" button. Click → panel opens. Test each control:
- Change palette → colors swap across hero, HUD, panels live.
- Toggle Sunburst → rotating bursts disappear.
- Toggle Scanlines → scanlines overlay disappears.
- Toggle Film Grain → noise overlay disappears.
- Move intensity slider 1↔10 → parallax tilt + fly aggression scale.
- Toggle UI Sounds OFF → no audio on interactions.
- Reload page → all settings persist (check localStorage `portfolio.tweaks`).

- [ ] **Step 4: Commit**

```bash
git add components/TweaksPanel.tsx components/Stage.tsx
git commit -m "add TweaksPanel UI with palette / overlay / motion / sound controls"
```

---

## Task 21: Reduced-motion + mobile fallback

**Files:**
- Modify: `app/globals.css`
- Modify: `hooks/useParallax.ts`

- [ ] **Step 1: Add reduced-motion media query to `app/globals.css`**

Append to the bottom of `app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .panel-card,
  .cta,
  .hud .dot,
  .bg-burst,
  .bg-burst.alt,
  .reveal,
  .reveal.d1,
  .reveal.d2,
  .reveal.d3,
  .reveal.d4 {
    animation: none !important;
    transition: none !important;
  }

  .reveal,
  .reveal.d1,
  .reveal.d2,
  .reveal.d3,
  .reveal.d4 {
    opacity: 1 !important;
    transform: none !important;
  }

  .world {
    transition: none !important;
  }
}
```

- [ ] **Step 2: Short-circuit parallax under reduced motion**

In `hooks/useParallax.ts`, add a check inside the tick:

```ts
const prefersReduced = typeof window !== "undefined"
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ... inside tick ...
if (prefersReduced) {
  if (worldRef.current) worldRef.current.style.transform = "";
} else if (view === "home" && worldRef.current) {
  const k = motionIntensity / 10;
  worldRef.current.style.transform = `...`;
}
```

- [ ] **Step 3: Mobile fallback CSS**

Append to `app/globals.css`:

```css
@media (max-width: 767px), (pointer: coarse) {
  .scene { perspective: none; }
  .scene-scaler { transform: none !important; }
  .world {
    transform: none !important;
    transform-style: flat;
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 80px 16px;
  }
  .deco, .hero { display: none; }
  .panel {
    position: relative !important;
    transform: none !important;
    top: auto; left: auto;
  }
  .panel-card {
    position: relative;
    transform: none;
    width: 100%;
    max-width: 360px;
    margin: 0 auto;
    animation: none;
  }
  .hud .corner.bl { display: none; }
  .section-inner { padding: 60px 20px 40px 20px; }
  .section-body { grid-template-columns: 1fr !important; gap: 24px !important; }
}
```

- [ ] **Step 4: Verify**

http://localhost:3000.
1. Open devtools → Rendering → "Emulate CSS media feature prefers-reduced-motion" → "reduce". Reload. Expected: no float, no parallax, no sunburst rotation, no CTA blink. Fly transition is instant.
2. Resize to 400×900 (or open devtools device mode → iPhone). Expected: panels stack vertically, no 3D, hero hidden, HUD bottom-left chips hidden. Tap a card → goes to section. Back button works.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css hooks/useParallax.ts
git commit -m "add reduced-motion overrides and mobile vertical-stack fallback"
```

---

## Task 22: Cloudflare Pages preview + manual test plan

**Files:**
- No code changes; deploy + verify.

- [ ] **Step 1: Build for Cloudflare**

```bash
pnpm pages:build
```

Expected: build completes; `.vercel/output/static` directory created.

- [ ] **Step 2: Local Cloudflare preview**

```bash
pnpm pages:preview
```

Open the URL printed (typically http://localhost:8788). Expected: full site works identically to `pnpm dev`. Test fly, back, palette swap, persistence reload.

- [ ] **Step 3: Run full manual test plan (spec §10)**

For each item below, confirm pass:

1. Home menu loads — fonts swap in, 4 panels in correct quadrants, hero centered, HUD chrome in all 4 corners, ticker rotates every 700ms.
2. Parallax — mouse movement tilts world smoothly, no jitter, no lag.
3. Float animation — 4 panels bob with staggered delays (0 / 0.8 / 1.6 / 2.4s).
4. Hover — card border brightens to full accent, glow grows, animation pauses, lift 6px.
5. Click panel — whoosh + click play, flash + streak fire, world flies through panel, section fades in over 350ms, thud plays.
6. Back — reverse fly, parallax resumes immediately.
7. Keyboard nav — arrows move focus (TL/TR/BL/BR), focused panel shows yellow outline, Enter triggers fly, Esc returns home.
8. Tweaks panel — palette swaps live, sunburst/scanlines/grain toggle correctly, motion slider scales, sound toggle silences.
9. Persistence — reload page, tweaks restore.
10. Responsive — 1100×800, 800×600, 400×900. Scale clamps. <768px → vertical stack.
11. Reduced motion — toggle OS / devtools setting → parallax/float/sunburst/blink stop, fly becomes instant.
12. Sections — About 2-col, Projects 2-col cards, Skills 3-col, Contact 1.2fr/1fr, reveal d1→d4 stagger, ghost word behind.
13. No console errors, no hydration warnings.

Cross-browser: run the above in Chrome, Safari, Firefox. Safari first.

- [ ] **Step 4: Deploy preview (optional, when ready)**

```bash
pnpm pages:deploy
```

Requires Cloudflare account + `wrangler login` first. Skip if not deploying yet.

- [ ] **Step 5: Final commit**

If any small fixes were needed during testing, commit them. Otherwise just tag the milestone:

```bash
git tag v0.1-portfolio-mvp
git log --oneline -25
```

Expected: 22 commits showing the build progression.

---

## Done

Build matches handoff design. Real content (bio, projects, contact, images) is a follow-up — swap in by editing `components/sections/*.tsx` and replacing striped placeholders with `next/image` when assets are ready.
