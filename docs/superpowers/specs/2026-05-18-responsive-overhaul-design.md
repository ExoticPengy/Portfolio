# Responsive Overhaul — Design Spec

**Date:** 2026-05-18
**Status:** Approved
**Approach:** A — Tiered CSS Breakpoints

## Summary

Full responsive overhaul of the ML Portfolio site. Replace single `max-width: 767px, pointer: coarse` query with tiered breakpoint system. Fix horizontal overflow on all section grids. Scale typography. Improve touch targets. Add mobile hero. Simplify HUD on small screens.

## Breakpoint System

Replace current single media query with:

| Key | Query | Targets |
|-----|-------|---------|
| `touch` | `(pointer: coarse)` | Touch-only fixes (hover fallbacks, touch targets). No viewport coupling. |
| `sm` | `max-width: 639px` | Phones — flat layout, stacked grids, condensed typography |
| `md` | `min-width: 640px and max-width: 1023px` | Tablets — 3D scene stays (scaled), adjusted grid columns |
| `lg` | `min-width: 1024px` | Desktop — current layout, no changes |

Existing `(max-width: 767px), (pointer: coarse)` block removed and split across the new breakpoints.

## Home Page — Mobile (sm: ≤639px)

### Hero
- Currently `display: none` on mobile. Change: show condensed version.
- Name: `clamp(32px, 8vw, 56px)` (desktop: `clamp(40px, 5.2vw, 70px)`)
- CTA button: smaller padding, still visible
- Eyebrow/tag: same structure, smaller font

### Panels
- Keep flat flex column layout (already applied)
- `gap: 16px`, `padding: 60px 16px`
- Remove fixed `width: 300px; height: 360px` — let cards fill width
- `panel-card`: `width: 100%; max-width: none; height: auto; margin: 0`
- `panel-img`: height 100px (down from 160px)
- `panel-stage` (big number): `font-size: 120px` (down from 220px), `pointer-events: none`
- `panel-label .big`: `font-size: 28px` (down from 38px)

### Touch interception fix
- `.panel-stage`, `.panel-glyph`, `.panel-img`, `.panel-label`, `.panel-corner`: all `pointer-events: none`
- Only `.panel` itself receives clicks

### Background
- Grid, vignette, burst, noise, scanlines: unchanged (perform fine on mobile)

## Section Views — Mobile (sm: ≤639px)

### Section Shell
- `section-inner` padding: `40px 16px 32px 16px` (desktop: `80px 80px 60px 80px`)
- `section-head`: flex-direction column on very narrow (<400px), row otherwise
- `section-ghost`: `font-size: clamp(80px, 25vw, 40vw)`
- Heading h1: `clamp(36px, 8vw, 64px)` (desktop: `clamp(64px, 9vw, 140px)`)
- Back button: smaller padding, sits under title on narrow screens

### About
- `section-body`: single column (already `1fr !important`)
- Bio font: `14px` (down from `16px`)
- `about-stats`: keep 2-col (stat cards simple, fit at ~150px each)
- Headshot: reduced height, keep 4:5 ratio

### Projects
- `projects-grid`: `grid-template-columns: 1fr` (override `1fr 1fr`)
- `project-img`: height `160px` (down from `280px`)
- `project-title`: `clamp(24px, 6vw, 38px)`
- `project-body`: `padding: 16px 20px 20px 20px`
- Gap: `20px` (down from `32px`)

### Skills
- `skills-grid`: `grid-template-columns: 1fr` (override `1fr 1fr 1fr`)
- Each category full width, stacked
- `skill-cat`: padding `20px` (down from `24px`)

### Contact
- `contact-body`: `grid-template-columns: 1fr` (override `1.2fr 1fr`)
- Contact lines stack above CTA
- `contact-row .v`: `clamp(20px, 5vw, 28px)`
- CTA `font-size`: `clamp(28px, 7vw, 48px)`
- CTA button: full width
- Gap: `24px` (down from `48px`)

### Scroll
- `section-view`: `overflow-y: auto` (allow scroll when content exceeds viewport)

## HUD — Mobile (sm: ≤639px)

- Font size: `10px` (down from `11px`)
- Corners: `max-width: calc(100vw - 32px)` prevent overflow
- Top-left: "MAIN MENU · STAGE SELECT" (keep)
- Top-right: "PLAYER · PENGY | LV. XX" (keep)
- Bottom-left: keyboard hints remain `display: none` (touch devices don't need)
- Bottom-right ticker: move inline with top-right or hide on sm
- Dot pulse stays

## Tweaks Panel — Mobile

- Tweaks button: `bottom: 24px; right: 16px; font-size: 10px; padding: 6px 10px`
- Open panel: `left: 16px; right: 16px; width: auto; max-height: 60vh; overflow-y: auto`

## Pokemon Track — Mobile

- Keep existing (bottom track with animated sprites)
- Reduce to 3 Pokemon on sm (hide last 2 via CSS) to reduce visual clutter

## Tablet (md: 640px–1023px)

- 3D scene stays active, scaled via `--world-scale`
- Panels keep 3D transforms
- Section grids:
  - Skills: `1fr 1fr` (2 columns, 3rd category spans full row below)
  - Projects: `1fr 1fr` (fits at tablet widths)
  - Contact: `1.2fr 1fr` (fits at tablet widths)
  - About: unchanged (already 2-col)
- Hero stays visible
- HUD: desktop-style, slightly smaller fonts

## Pointer Coarse (any width)

- All touch devices: `touch-action: manipulation` on interactive elements
- Minimum tap target 44×44px (panel cards already exceed)
- No hover-dependent UI on touch (panel hover glow → active/tap glow instead)
- Keyboard hints hidden on all touch devices

## What Does Not Change

- Desktop layout (1024px+) untouched
- Color palettes, CSS custom properties
- 3D parallax, fly transitions, audio, keyboard nav
- Pokemon runners (except count reduction)
- All component TSX structure (pure CSS changes)

## Implementation Order

1. Refactor media queries — split `(max-width: 767px), (pointer: coarse)` into sm/md/touch blocks
2. Fix grid overflows (projects, skills, contact) — these are the critical bugs
3. Hero on mobile
4. Typography scaling via `clamp()`
5. Panel touch fixes (pointer-events)
6. HUD mobile simplification
7. Tweaks panel repositioning
8. Tablet (md) fine-tuning
9. Test on Playwright at 375px, 640px, 768px, 1024px
