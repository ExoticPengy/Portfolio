# Responsive Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace single `max-width: 767px, pointer: coarse` media query with tiered breakpoint system (sm ≤639px, md 640-1023px, touch pointer:coarse). Fix all grid overflows, scale typography, add mobile hero, fix touch targets, simplify HUD.

**Architecture:** Pure CSS changes to `app/globals.css`. No TSX modifications. Existing desktop styles untouched. New tiered breakpoints stack via cascade — touch rules first (broadest), then sm (phones), then md (tablets). All overrides use `!important` minimally — only where needed to beat existing specificity.

**Tech Stack:** CSS custom properties, media queries, clamp(), grid, flexbox.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `app/globals.css:1097-1125` | Replace | Remove old combined media query |
| `app/globals.css:1096-1126` | Insert | New tiered breakpoint block: touch + sm + md |

---

### Task 1: Remove old mobile media query

**Files:**
- Modify: `app/globals.css:1097-1125`

- [ ] **Step 1: Delete the old combined block**

Remove lines 1097–1125 (the entire `@media (max-width: 767px), (pointer: coarse) { ... }` block).

```css
// Delete this entire block (lines 1097-1125):
// @media (max-width: 767px), (pointer: coarse) {
//   .scene { perspective: none; }
//   .scene-scaler { transform: none !important; }
//   .world { ... }
//   .deco, .hero { display: none; }
//   .panel { ... }
//   .panel-card { ... }
//   .hud .corner.bl { display: none; }
//   .section-inner { padding: 60px 20px 40px 20px; }
//   .section-body { grid-template-columns: 1fr !important; gap: 24px !important; }
// }
```

- [ ] **Step 2: Verify build still passes**

Run: `cd /Users/pengy/Documents/GitHub/Portfolio && pnpm build 2>&1 | tail -5`
Expected: Successful build (no CSS errors from missing closing brace)

- [ ] **Step 3: Stage the deletion**

```bash
git add app/globals.css
```

Do NOT commit yet — we stage only. All tasks commit together at the end.

---

### Task 2: Add touch-device block (pointer: coarse)

**Files:**
- Modify: `app/globals.css` (insert after line 1095, before the closing of `@media (prefers-reduced-motion: reduce)`)

- [ ] **Step 1: Insert touch-device media query**

Add after line 1095 (end of reduced-motion block) and before the final blank line:

```css

/* === Responsive: Touch devices === */
@media (pointer: coarse) {
  .hud .corner.bl { display: none; }
  .panel-stage,
  .panel-glyph,
  .panel-img,
  .panel-label,
  .panel-corner { pointer-events: none; }
  .panel:hover .panel-card {
    animation-play-state: running;
    top: auto;
  }
  .panel:active .panel-card {
    border-color: var(--accent);
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.6) inset,
      0 40px 100px -10px rgba(0,0,0,0.9),
      0 0 100px -5px var(--accent);
    filter: brightness(1.1);
  }
  .panel:active .panel-num { color: var(--fg); text-shadow: 0 0 20px var(--accent); }
  .panel:active .panel-label .arrow { transform: translateX(6px); }
  .panel:active .panel-stage { color: color-mix(in oklab, var(--accent-2) 32%, transparent); }
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build 2>&1 | tail -5`
Expected: Successful build

- [ ] **Step 3: Stage**

```bash
git add app/globals.css
```

---

### Task 3: Add mobile breakpoint (sm: max-width 639px) — Scene, World, Panels, Hero

**Files:**
- Modify: `app/globals.css` (append after touch block)

- [ ] **Step 1: Insert sm breakpoint — scene/world/panels/hero**

```css

/* === Responsive: Phones (sm ≤ 639px) === */
@media (max-width: 639px) {
  /* Scene — flatten */
  .scene { perspective: none; }
  .scene-scaler { transform: none !important; }
  .world {
    transform: none !important;
    transform-style: flat;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 60px 16px;
  }

  /* Decor — hidden */
  .deco { display: none; }

  /* Hero — condensed, visible */
  .hero {
    position: relative;
    top: auto; left: auto;
    transform: none;
    max-width: 100%;
    margin-bottom: 16px;
    padding: 0 8px;
  }
  .hero.fading { opacity: 1; }
  .hero .name {
    font-size: clamp(32px, 8vw, 56px);
  }
  .hero .eyebrow {
    font-size: 10px;
    letter-spacing: 0.3em;
    margin-bottom: 10px;
  }
  .hero .eyebrow::before,
  .hero .eyebrow::after { width: 20px; }
  .hero .tag {
    font-size: 10px;
    margin-top: 10px;
  }
  .hero .cta {
    font-size: 13px;
    margin-top: 18px;
    padding: 6px 12px;
    gap: 6px;
    pointer-events: auto;
  }

  /* Panels — flat, full-width cards */
  .panel {
    position: relative !important;
    transform: none !important;
    top: auto !important;
    left: auto !important;
    width: 100%;
    height: auto;
    margin: 0;
  }
  .panel-card {
    position: relative;
    transform: none;
    width: 100%;
    max-width: none;
    height: auto;
    margin: 0;
    animation: none;
  }
  .panel-img { height: 100px; }
  .panel-stage {
    font-size: 120px;
    top: -20px;
    right: -8px;
  }
  .panel-label .big { font-size: 28px; }
  .panel-num { font-size: 9px; }
  .panel-card .panel-corner { display: none; }
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build 2>&1 | tail -5`
Expected: Successful build

- [ ] **Step 3: Stage**

```bash
git add app/globals.css
```

---

### Task 4: Add mobile breakpoint — Section views

**Files:**
- Modify: `app/globals.css` (extend sm block from Task 3)

- [ ] **Step 1: Append section views rules inside sm block**

Add these rules INSIDE the `@media (max-width: 639px)` block, before the closing `}`:

```css
  /* Section views */
  .section-inner { padding: 40px 16px 32px 16px; }
  .section-body { grid-template-columns: 1fr !important; gap: 24px !important; }
  .section-view { overflow-y: auto; }

  /* Section head */
  .section-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 14px;
  }
  .section-head h1 { font-size: clamp(36px, 8vw, 64px); }
  .section-head .back {
    font-size: 10px;
    padding: 8px 12px;
  }

  /* Ghost text */
  .section-ghost { font-size: clamp(80px, 25vw, 40vw); }

  /* About */
  .about-bio { font-size: 14px; }
  .about-stats { gap: 12px; }
  .stat-card { padding: 16px; }
  .stat-card .value { font-size: 40px; }
  .headshot { aspect-ratio: 3/2; }

  /* Projects */
  .projects-grid { grid-template-columns: 1fr; gap: 20px; }
  .project-img { height: 160px; }
  .project-title { font-size: clamp(24px, 6vw, 38px); }
  .project-body { padding: 16px 20px 20px 20px; }
  .project-desc { font-size: 13px; }

  /* Skills */
  .skills-grid { grid-template-columns: 1fr; gap: 16px; }
  .skill-cat { padding: 20px; }
  .skill-cat h3 { font-size: 18px; }
  .skill-cat li { font-size: 13px; }

  /* Contact */
  .contact-body { grid-template-columns: 1fr; gap: 24px; }
  .contact-row { padding-bottom: 10px; }
  .contact-row .k { font-size: 10px; }
  .contact-row .v { font-size: clamp(20px, 5vw, 28px); }
  .contact-cta { padding: 24px; }
  .contact-cta .big { font-size: clamp(28px, 7vw, 48px); }
  .contact-cta .small { font-size: 13px; }
  .contact-cta button {
    width: 100%;
    text-align: center;
    font-size: 16px;
    padding: 14px 20px;
  }
```

- [ ] **Step 2: Verify build**

Run: `pnpm build 2>&1 | tail -5`
Expected: Successful build

- [ ] **Step 3: Stage**

```bash
git add app/globals.css
```

---

### Task 5: Add mobile breakpoint — HUD, Tweaks, Pokemon track

**Files:**
- Modify: `app/globals.css` (extend sm block from Task 4)

- [ ] **Step 1: Append HUD/Tweaks/Pokemon rules inside sm block**

Add these rules INSIDE the `@media (max-width: 639px)` block, before the closing `}`:

```css
  /* HUD */
  .hud { font-size: 10px; }
  .hud .corner { max-width: calc(100vw - 32px); }
  .hud .corner.br { display: none; }
  .hud .corner.bl { display: none; }
  .hud .bracket { font-size: 12px; }

  /* Tweaks button reposition */
  .poke-track { height: 60px; }
}
```

- [ ] **Step 2: Add Tweaks button and Pokemon count rules OUTSIDE sm block**

The Tweaks button styles are inline (TweaksPanel.tsx uses style prop). Add a CSS override AFTER the sm media query block.

Wait — TweaksPanel uses inline `style={{ position: "fixed", right: 24, bottom: 64, ... }}`. Inline styles beat CSS classes. We need to use `!important` or target the button differently.

Add this rule AFTER the sm block closing `}`:

```css

/* Tweaks button — mobile reposition (beats inline style via !important) */
@media (max-width: 639px) {
  body > div > button[style*="bottom: 64px"] {
    bottom: 16px !important;
    right: 16px !important;
    font-size: 10px !important;
    padding: 6px 10px !important;
  }

  /* Pokemon — hide last 2 on small screens */
  .poke-sprite:nth-child(n+4) { display: none; }
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm build 2>&1 | tail -5`
Expected: Successful build

- [ ] **Step 4: Stage**

```bash
git add app/globals.css
```

---

### Task 6: Add tablet breakpoint (md: 640px–1023px)

**Files:**
- Modify: `app/globals.css` (append after sm blocks)

- [ ] **Step 1: Insert md breakpoint**

```css

/* === Responsive: Tablets (md 640px – 1023px) === */
@media (min-width: 640px) and (max-width: 1023px) {
  .section-inner { padding: 60px 40px 50px 40px; }
  .section-head h1 { font-size: clamp(48px, 7vw, 100px); }

  /* Skills: 2 columns, 3rd wraps */
  .skills-grid { grid-template-columns: 1fr 1fr; }

  /* Projects: keep 2 columns, reduce image height */
  .project-img { height: 200px; }
  .project-title { font-size: 28px; }
  .project-body { padding: 20px 24px 24px 24px; }

  /* Contact: reduce gap */
  .contact-body { gap: 32px; }
  .contact-row .v { font-size: 22px; }
  .contact-cta .big { font-size: 36px; }

  /* Section ghost smaller */
  .section-ghost { font-size: 25vw; }

  /* HUD slightly smaller */
  .hud { font-size: 10px; }
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build 2>&1 | tail -5`
Expected: Successful build

- [ ] **Step 3: Stage**

```bash
git add app/globals.css
```

---

### Task 7: Verify with Playwright and fix any issues

**Files:**
- Read: `app/globals.css` (full file for reference)

- [ ] **Step 1: Start dev server**

```bash
pnpm dev --port 3099 &
sleep 3
```

- [ ] **Step 2: Test at 375px (iPhone SE) — Home page**

Using Playwright, navigate to `http://localhost:3099`, set viewport 375×812, and verify:
- Hero visible with name "CHONG MING LI"
- 4 panel cards stacked vertically, full width
- No horizontal overflow (`document.body.scrollWidth <= window.innerWidth`)
- HUD top-left/top-right visible, bottom corners hidden
- Tweaks button at bottom-right, above Pokemon

- [ ] **Step 3: Test at 375px — Section views**

Click each panel (About, Projects, Skills, Contact) and verify:
- Single column grids, no horizontal overflow
- All content visible, no cut-off text
- Back button visible and functional
- Typography sized correctly (no giant fonts)

- [ ] **Step 4: Test at 768px (iPad Mini) — Tablet**

Set viewport 768×1024 and verify:
- 3D scene active (panels have 3D transforms)
- Section grids: skills 2-col, projects 2-col, contact 2-col
- No horizontal overflow

- [ ] **Step 5: Test at 1024px+ — Desktop**

Set viewport 1440×900 and verify:
- Layout unchanged from current desktop
- All original 3D transforms, hover effects intact

- [ ] **Step 6: Fix any issues found and commit**

```bash
git add app/globals.css
git commit -m "$(cat <<'EOF'
fix: responsive overhaul — tiered breakpoints, fix grid overflows

Replace single max-width:767px query with sm (≤639px), md (640-1023px),
and touch (pointer:coarse) breakpoints. Fix horizontal overflow on
projects, skills, and contact grids. Add condensed mobile hero. Scale
typography with clamp(). Fix touch targets via pointer-events.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task Summary

| Task | What | Lines |
|------|------|-------|
| 1 | Delete old `@media (max-width: 767px), (pointer: coarse)` block | 1097-1125 |
| 2 | Add `@media (pointer: coarse)` — touch fixes | new |
| 3 | Add `@media (max-width: 639px)` — scene, world, panels, hero | new |
| 4 | Extend sm block — section views (About, Projects, Skills, Contact) | new |
| 5 | Extend sm block — HUD, Tweaks button, Pokemon count | new |
| 6 | Add `@media (min-width: 640px) and (max-width: 1023px)` — tablet | new |
| 7 | Playwright verification — 375px, 768px, 1440px | — |
