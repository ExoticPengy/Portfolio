<h1 align="center">⚡ Arcade Portfolio</h1>
<h3 align="center"><em>A personal portfolio that plays like a retro arcade game — press start, pick a stage, clear it.</em></h3>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare" alt="Cloudflare Pages"/>
  <img src="https://img.shields.io/badge/tested%20with-Vitest-6E9F18?style=for-the-badge&logo=vitest" alt="Vitest"/>
</p>

---

## 📖 About The Project

**Arcade Portfolio** is a personal portfolio dressed up as a retro, Pokémon-battle-style video game. Instead of scrolling a flat page, visitors boot into a game, land on a four-panel arcade menu, and "fly" into each section like entering a stage — **About** (the character), **Projects** (stages cleared), **Skills** (abilities), and **Contact** (channels).

It's a single-page **Next.js 15** app built with **React 19** and **TypeScript**, hand-styled in CSS with a full CRT aesthetic — scanlines, grain, sunburst, and animated move effects. A tweaks panel lets visitors recolour the whole UI across **9 palettes**, dial motion intensity, and toggle sound and music (powered by a custom Web Audio engine). There's even a Konami-code easter egg. It deploys to **Cloudflare Pages** (and Vercel).

---

## ✨ Features

|  | Feature | Description |
|--|---------|-------------|
| 🎮 | **Boot Sequence** | An arcade-style boot intro before the menu loads. |
| 🕹️ | **Four-Panel Menu** | A Pokémon-style home screen with About, Projects, Skills, and Contact panels. |
| ✈️ | **"Flying" Transitions** | Animated stage-entry transitions between the menu and each section. |
| 🏆 | **Projects as Stages** | Each project is a "stage cleared", with a rich detail view — high scores, tech loadout, feature unlocks, and an involvement log. |
| 💥 | **Stage Transitions** | Multiple randomized reveal effects (tear, mosaic, blinds, slash, cascade) when opening a project. |
| ⭐ | **Skills Matrix** | An abilities screen showcasing the tech stack. |
| 📡 | **Contact Channels** | A connect screen with links and channels. |
| 🎨 | **9 Palettes** | Recolour the entire UI live — Purple·Cyan, Arcade·Pink/Yellow, Acid·Violet, Mono·Red, and more. |
| 📺 | **CRT Effects** | Scanlines, film grain, and a sunburst backdrop for the retro feel. |
| 🔊 | **Sound & Music** | A custom Web Audio engine with toggles and independent SFX/music volume. |
| 🎚️ | **Tweaks Panel** | Live controls for palette, effects, motion intensity, and audio. |
| 🐾 | **Pokémon Runners** | Decorative sprites that run across the screen. |
| 🥚 | **Konami Easter Egg** | Enter the code for a "shiny" surprise. |
| 📱 | **Responsive** | Adapts from desktop arcade to mobile. |

---

## 🧭 Experience Flow

```
        ┌──────────────┐
        │ BOOT SEQUENCE │
        └──────┬───────┘
               ▼
        ┌──────────────┐
        │  HOME (menu)  │   four arcade panels
        └──────┬───────┘
               │  select a panel
               ▼
        ┌──────────────┐
        │   FLYING      │   stage-entry transition
        └──────┬───────┘
               ▼
   ┌───────┬───────┬────────┬─────────┐
   ▼       ▼       ▼        ▼
 ABOUT  PROJECTS  SKILLS  CONTACT
           │
           ▼
     PROJECT DETAIL
   high scores · tech loadout ·
   feature unlocks · involvement
   log · screenshots · links
```

---

## 🏗️ Architecture

A single-page **Next.js App Router** app. `Stage.tsx` is the orchestrator — it tracks the current `View` (`home · flying · about · projects · skills · contact`) and renders the right section with its transitions and overlays. User settings live in a `TweaksContext`, and the interactive behaviour is factored into focused **hooks** (`useAudio`, `useFlyTransition`, `useKeyboardNav`, `useKonami`, `useParallax`, `useResponsiveScale`, `useTweaks`). Presentation lives in `components/`; data and the audio engine live in `lib/`.

```
 ┌─────────────────────────────────────────────┐
 │  app/page.tsx → <Stage />                    │
 └─────────────────────┬───────────────────────┘
                       ▼
 ┌─────────────────────────────────────────────┐
 │  Stage.tsx  — view state + orchestration     │
 │  Boot → Home (panels) → Flying → Section     │
 └───┬───────────────┬───────────────┬──────────┘
     ▼               ▼               ▼
 ┌─────────┐  ┌──────────────┐  ┌──────────────┐
 │components│  │   hooks/      │  │   lib/        │
 │ Hero·Hud │  │ useAudio ·    │  │ panels·types ·│
 │ sections │  │ useFly ·      │  │ palettes ·    │
 │ FxOverlay│  │ useKeyboard · │  │ moves ·       │
 │ Tweaks…  │  │ useKonami …   │  │ audio·icons   │
 └─────────┘  └──────┬───────┘  └──────────────┘
                     ▼
              ┌──────────────┐
              │TweaksContext  │  palette · FX · audio
              └──────────────┘
```

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|:---------|:-----------|:--------|
| **Framework** | Next.js `15` (App Router) | React framework + build |
| **UI Library** | React `19` | Component-driven interface |
| **Language** | TypeScript | Type-safe development |
| **Styling** | Hand-authored CSS (`app/globals.css`) | Arcade theme, CRT effects, palettes |
| **Icons** | react-icons | Section and link iconography |
| **Audio** | Web Audio API (`lib/audio.ts`) | SFX and music engine |
| **Testing** | Vitest | Unit tests (e.g. `lib/moves`) |
| **Hosting** | Cloudflare Pages (`@cloudflare/next-on-pages`, Wrangler) · Vercel | Edge deployment |

---

## 📂 Project Structure

```
Portfolio/
├── app/
│   ├── page.tsx                # Entry — renders <Stage />
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # All styling (arcade theme, CRT FX, palettes)
│   └── not-found.tsx           # 404
│
├── components/
│   ├── Stage.tsx               # Orchestrator: view state + tweaks
│   ├── BootSequence.tsx        # Boot intro
│   ├── Hero.tsx / Hud.tsx      # Home menu + heads-up display
│   ├── Background.tsx / Decor.tsx / FxOverlays.tsx   # Backdrop + CRT effects
│   ├── MoveFx.tsx              # Stage-entry move effects
│   ├── PokemonRunners.tsx      # Decorative running sprites
│   ├── Panel.tsx / TweaksPanel.tsx                    # Menu panels + settings
│   └── sections/
│       ├── SectionShell.tsx    # Shared section frame
│       ├── About.tsx
│       ├── Projects.tsx        # Project grid ("stages")
│       ├── ProjectDetail.tsx   # Per-project detail view
│       ├── Skills.tsx
│       └── Contact.tsx
│
├── hooks/
│   ├── useAudio.ts             # Audio init on first interaction
│   ├── useFlyTransition.ts     # Menu → section "flying" transition
│   ├── useKeyboardNav.ts       # Arrow/Enter panel navigation
│   ├── useKonami.ts            # Konami-code easter egg
│   ├── useParallax.ts          # Pointer parallax
│   ├── useResponsiveScale.ts   # Scale to viewport
│   └── useTweaks.ts            # Tweaks helper
│
├── context/
│   └── TweaksContext.tsx       # Palette, FX, and audio settings
│
└── lib/
    ├── types.ts                # View, ProjectData, Tweaks, palettes
    ├── panels.ts               # Home-menu panel definitions
    ├── palettes.ts             # 9 colour palettes
    ├── stageIcons.tsx          # Section icons
    ├── moves.ts                # Move/transition logic (+ __tests__)
    └── audio.ts                # Web Audio SFX + music engine
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm (or pnpm)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ExoticPengy/Portfolio.git
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the dev server**

   ```bash
   npm run dev      # http://localhost:3000
   ```

4. **Other scripts**

   ```bash
   npm run build    # production build
   npm test         # run Vitest tests
   npm run lint     # lint
   ```

### Deployment

Deploys to **Cloudflare Pages** via `@cloudflare/next-on-pages`:

```bash
npm run pages:preview   # build + local preview
npm run pages:deploy    # build + deploy
```

---

## 🎮 Easter Egg

Try the **Konami code** (↑ ↑ ↓ ↓ ← → ← → B A) once you're in. ✨

---

## 📝 License

Private project — all rights reserved.
