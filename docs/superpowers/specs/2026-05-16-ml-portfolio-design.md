# ML Portfolio — Kinetic 3D Stage-Select Menu

**Date:** 2026-05-16
**Owner:** Chong Ming Li (Pengy)
**Status:** Design — approved, ready for implementation plan
**Handoff source:** `design_handoff_ml_portfolio/` (Claude Design)

## 1. Summary

Personal portfolio for a Software Developer / Data Scientist, presented as a game-style "stage select" menu. Four floating 3D panels (About, Projects, Skills, Contact) tilt with the cursor and bob gently. Clicking a panel triggers a cinematic camera fly-through into that section, scored with Web Audio synth. Esc / Back button returns to the menu.

Visual language: "synthwave arcade" — deep purple base, cyan accent, slowly rotating sunburst background, heavy italic display type, monospace HUD chrome.

A Tweaks panel exposes palette swaps, motion intensity, sunburst/scanline/grain toggles, and a sound toggle.

The design handoff is **high-fidelity**: hex values, type sizes, animation timings, transform math, panel coordinates, and CSS keyframes are all prescribed. This spec covers the **build architecture** — how to recreate that design in a production Next.js codebase. Implementation must match handoff values exactly; see `design_handoff_ml_portfolio/README.md` for visual spec.

## 2. Tech stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI:** React 18 (client component for the interactive `<Stage />` tree)
- **Styling:** Global CSS (`app/globals.css`) ported from `design_handoff_ml_portfolio/styles.css`. Palettes implemented as `[data-palette="name"]` selectors on `<body>` swapping CSS custom properties.
- **Fonts:** `next/font` self-hosting Archivo Black, Space Grotesk (400/500/700), Space Mono (400/700).
- **Audio:** Web Audio API, port `design_handoff_ml_portfolio/audio.js` as `lib/audio.ts`.
- **Deploy:** Cloudflare Pages via `@cloudflare/next-on-pages`.
- **Tests:** None automated. Manual browser test plan in §10.
- **Package manager:** pnpm.

## 3. Route shape

Single page `app/page.tsx` renders `<Stage />` — owns view state, swaps between home menu and section views **without route changes**. The parallax world and fly-through transition require a continuous, never-unmounted 3D scene; per-section routes would break the cinematic.

`app/layout.tsx` mounts `<TweaksProvider>`, applies fonts via `next/font`, and sets the initial `data-palette` attribute on `<body>`.

## 4. File structure

```
app/
  layout.tsx
  page.tsx
  globals.css
components/
  Stage.tsx               # owns view state, world ref, routes home vs section
  Hero.tsx                # eyebrow + name + tag + CTA
  Hud.tsx                 # 4 corner chrome blocks
  Panel.tsx               # one stage-select card
  Decor.tsx               # background stroked words
  FxOverlays.tsx          # .flash + .streak overlays
  Background.tsx          # .bg-burst, scanlines, grain (toggle-gated)
  TweaksPanel.tsx         # palette/sunburst/scanlines/grain/motion/sound controls
  sections/
    SectionShell.tsx      # shared header + back button + ghost word + reveal wrapper
    About.tsx
    Projects.tsx
    Skills.tsx
    Contact.tsx
hooks/
  useParallax.ts          # RAF loop; writes transform to worldRef
  useFlyTransition.ts     # fly + back; inline transition mgmt; view setter
  useKeyboardNav.ts       # arrows, enter, esc
  useResponsiveScale.ts   # resize listener; sets --world-scale
  useAudio.ts             # init on first gesture; whoosh/click/thud/hover
  useTweaks.ts            # context hook
lib/
  audio.ts                # Web Audio synth (ported audio.js)
  panels.ts               # 4 panel data records
  palettes.ts             # palette name list + type
  types.ts                # View, PanelData, Tweaks, etc.
context/
  TweaksContext.tsx       # provider + reducer + localStorage hydration
```

Each hook owns one effect; each component owns one visual region. `Stage` composes them but does no rendering beyond layout scaffolding.

## 5. State management

### Stage state (React)
```ts
type View = 'home' | 'flying' | 'about' | 'projects' | 'skills' | 'contact';

const [view, setView] = useState<View>('home');
const [focusedId, setFocusedId] = useState<string | null>(null);
const [keyboardIdx, setKeyboardIdx] = useState<number>(0); // 0..3
```

### Stage refs (imperative — avoid React re-renders)
- `worldRef: RefObject<HTMLDivElement>` — target of per-frame transform writes
- `mouseRef: RefObject<{x, y, tx, ty}>` — smoothed mouse position, mutated by RAF
- `audioReadyRef: RefObject<boolean>` — gate first-gesture audio init

### Tweaks state (Context + reducer + localStorage)
```ts
type Tweaks = {
  palette: PaletteName;       // 'purple' default
  sunburst: boolean;          // true
  scanlines: boolean;         // true
  grain: boolean;             // true
  motionIntensity: number;    // 1..10, default 6
  soundEnabled: boolean;      // true (default on after first user gesture per spec); user can toggle off
};
```

Note on audio: `soundEnabled` defaults to `true`. The `AudioContext` itself can't be created until the first user gesture (browser policy), so `useAudio` defers init regardless of this flag. Once initialized, the flag gates whether play calls produce sound.

`TweaksProvider` hydrates from `localStorage.portfolio.tweaks` in a `useEffect` (not `useLayoutEffect` — avoid SSR mismatch). Writes are debounced into the same key on change.

## 6. Data flow

1. `Stage` reads `tweaks` from context, passes `motionIntensity` to `useParallax` and `useFlyTransition`.
2. `useParallax(worldRef, mouseRef, view, motionIntensity)` runs a `requestAnimationFrame` loop **only while `view === 'home'`**. Each frame: `x += (tx - x) * 0.08`, then write `worldRef.current.style.transform = ...`.
3. Panel click → `useFlyTransition.fly(panel)`:
   - Play whoosh + click via `useAudio`
   - `setView('flying')`, `setFocusedId(panel.id)`
   - Inline `style.transition = 'transform ${850 - intensity*15}ms cubic-bezier(0.7, 0, 0.15, 1)'`
   - Apply fly transform (see handoff §"Fly-through transition")
   - Fire `.flash` + `.streak` overlays (CSS-driven 700ms / 800ms)
   - `setTimeout(700)` → play thud, `setView(panel.id)` — section fades in, scene fades out
4. Back button → `useFlyTransition.back()`:
   - Play click + soft whoosh
   - `setView('home')`
   - Inline `transition: transform 800ms cubic-bezier(0.2, 0.7, 0.2, 1)`, transform to identity
   - `setTimeout(850)` → **clear inline transition** so parallax RAF can write per-frame without lag
5. `useKeyboardNav` reads `view, keyboardIdx`; arrows move focus (quadrant model 0=TL/1=TR/2=BL/3=BR), Enter/Space calls `fly`, Esc calls `back`.
6. Palette change → context sets `palette` → `layout.tsx` effect writes `document.body.dataset.palette` → CSS custom-property cascade re-colors everything.

## 7. Tweaks panel

Port `design_handoff_ml_portfolio/tweaks-panel.jsx` as `components/TweaksPanel.tsx`. Drop the host-protocol postMessage layer (`__edit_mode_available` / `__activate_edit_mode`) — replace with a floating "Tweaks" button bottom-right that toggles panel visibility.

Controls:

| Control | Type | Effect |
|---|---|---|
| Palette | `<select>` | Writes `data-palette` on `<body>` |
| Sunburst | toggle | Show/hide `.bg-burst` + `.bg-burst.alt` |
| Scanlines | toggle | Show/hide `.scanlines` overlay |
| Film Grain | toggle | Show/hide `.grain` SVG noise overlay |
| Motion Intensity | range 1..10 | Scales parallax tilt + fly aggression |
| UI Sounds | toggle | Gates Web Audio synth |

All settings persist to `localStorage.portfolio.tweaks`.

## 8. Content

Ship v1 with **placeholder content from handoff** (`sections.jsx` defaults — stub bio, "STAGE 01" project cards, sample skills list, contact rows). Real content swap deferred to a follow-up task.

Images: striped CSS placeholders. Real headshot + project covers swap to `next/image` later.

## 9. Edge cases & error handling

- **Web Audio init:** browser blocks `AudioContext` until user gesture. `useAudio` defers `new AudioContext()` to first click/keydown. Failures (Safari quirks, blocked context) caught silently; all play calls become no-ops.
- **`prefers-reduced-motion`:** parallax loop short-circuits to identity transform. Fly-through becomes instant view swap. Float / CTA blink / sunburst rotation / reveal animations disabled via `@media (prefers-reduced-motion: reduce)`. Honor regardless of motion slider.
- **localStorage:** wrap read + write in try/catch (private mode / disabled storage). Fall back to in-memory defaults on error.
- **Hydration:** server renders default palette `purple`. Client reads localStorage in `useEffect`, applies after mount. Brief flash acceptable.
- **Responsive:** `useResponsiveScale` clamps `[0.4, 1.0]`. Below 768px width (or `pointer: coarse`), fall back to a vertical stack of cards — parallax disabled, fly-through becomes a fade swap. Keeps tap targets usable.
- **Transition leaks:** `.world` MUST NOT have a default CSS transition. `useFlyTransition` sets inline `style.transition` only during fly/back, then clears via setTimeout (700ms / 850ms). Off-by-one here causes either cut-off transitions or laggy parallax.
- **Keyboard focus:** in home, only 4 panels + Tweaks toggle focusable. In sections, back button first, then content links. No focus trap. Esc always works.
- **Cloudflare bundle:** zero audio files (synth), no images yet, fonts self-hosted via `next/font`. Bundle stays small. No edge runtime needed — static client render.

## 10. Manual test plan

Run in `pnpm dev`, then again on Cloudflare preview deploy:

1. Home menu loads — fonts swap in, 4 panels in correct quadrants, hero centered, HUD chrome in all 4 corners, ticker rotates every 700ms.
2. Parallax — mouse movement tilts world smoothly, no jitter, no lag (confirms no default `.world` transition).
3. Float animation — 4 panels bob with staggered delays (0 / 0.8 / 1.6 / 2.4s).
4. Hover — card border brightens to full accent, glow grows, animation pauses, card lifts 6px.
5. Click panel — whoosh + click play, flash overlay flares, streak sweeps, world flies through panel, section fades in over 350ms, thud plays.
6. Back — reverse fly, parallax resumes immediately (no lag = inline transition cleared).
7. Keyboard nav — arrows move focus across 4 panels, focused panel shows yellow outline, Enter triggers fly, Esc returns home.
8. Tweaks panel:
   - Each palette swaps colors live across hero/HUD/panels/cards.
   - Sunburst, scanlines, grain toggles work.
   - Motion slider 1↔10 scales tilt + fly aggression.
   - Sound toggle silences synth.
9. Persistence — reload page, tweaks restore from localStorage.
10. Responsive — resize 1100×800, 800×600, 400×900. Scale clamps. Below 768px → vertical stack.
11. Reduced motion — toggle OS setting, reload. Parallax + float + sunburst + CTA blink all stop. Fly becomes instant.
12. Sections — each renders correct grid (About 2-col, Projects 2-col cards, Skills 3-col, Contact 1.2fr/1fr), reveal animations stagger d1→d4, ghost word visible behind.
13. No console errors. No hydration warnings.

Browsers: Chrome, Safari, Firefox. Test Safari first — Web Audio + `color-mix` historically flaky there.

## 11. Out of scope (v1)

- Real bio / project copy / contact info (deferred follow-up)
- Real headshot / project cover images
- Analytics
- Contact form backend — "Send Transmission" button is a `mailto:` link in v1
- Internationalization
- Automated tests (Vitest, Playwright)
- SEO meta beyond Next.js defaults

## 12. Implementation order

Suggested phasing, mirroring handoff §"Implementation order suggested":

1. Scaffold Next.js 15 + TypeScript + pnpm. Configure `next/font`. Set up Cloudflare Pages target.
2. Port `styles.css` → `app/globals.css`. All palettes as `[data-palette]` selectors.
3. Build static home menu — 4 panels in 3D space, hero, HUD. Verify positions / fonts / colors match.
4. Add `useResponsiveScale`, `useParallax`. Confirm world tilts (no default transition).
5. Add float animation + per-panel delays.
6. Build 4 section components statically. Confirm typography + layout.
7. Wire `useFlyTransition`: setView, flash/streak overlays, transform math.
8. Wire back: clear inline transition after 850ms.
9. Wire `useKeyboardNav` + Esc.
10. Port `audio.js` → `lib/audio.ts`. Wire whoosh/click/thud/hover.
11. Wire `TweaksContext` + `TweaksPanel`. Persist to localStorage.
12. Reduced-motion media query + mobile fallback.
13. Cloudflare Pages deploy preview. Run §10 test plan.

## 13. Gotchas (verbatim from handoff, surface here so they don't get lost)

- **No transition on `.world` by default.** A leftover 800ms transition will silently kill per-frame parallax.
- **CSS `scale()` requires a unitless number.** Compute scale in JS, write to CSS variable.
- **Don't use `display: none` to hide section views** — staggered `reveal` animations pause on hidden parents. Use `opacity` + `pointer-events: none`.
- **Space Mono lacks `★` and some glyphs.** Wrap glyphs in `<span style="font-family: system-ui">` to avoid baseline misalignment.
