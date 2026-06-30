import { useState, useCallback } from "react";
import SectionShell from "./SectionShell";
import ProjectDetail from "./ProjectDetail";
import { whoosh, click } from "@/lib/audio";
import type { ProjectData } from "@/lib/types";

const PROJECTS: ProjectData[] = [
  {
    num: "01",
    title: "TIAN DI",
    desc: "Lion and dragon dance troupe website. Landing page with booking, services, gallery, and contact sections — live at tiandi.app with 500+ performances under their belt.",
    tags: ["Next.js", "Tailwind CSS", "TypeScript", "LIVE"],
    img: "/images/projects/tiandi.png",
    live: "https://tiandi.app",
    favicon: "/images/tiandi-favicon.png",
    involvements: [
      "Built the full landing page with hero, about, services, gallery, and contact sections",
      "Implemented booking flow and responsive navigation with mobile support",
      "Deployed to production at tiandi.app",
    ],
    stats: [
      { value: "500+", label: "PERFORMANCES" },
      { value: "8", label: "PAGES" },
      { value: "LIVE", label: "DEPLOYED" },
    ],
    stack: [
      { name: "Next.js 16", role: "framework" },
      { name: "React 19", role: "UI" },
      { name: "TypeScript", role: "language" },
      { name: "Tailwind CSS", role: "styling" },
      { name: "Radix UI", role: "components" },
      { name: "Supabase", role: "backend" },
      { name: "Framer Motion", role: "animation" },
    ],
    features: [
      "Multi-page site: home, about, services, pricing, gallery, FAQ, contact",
      "Booking and contact flow to reserve performances",
      "Admin panel with Supabase-backed gallery management",
      "Testimonials, team, and FAQ sections",
    ],
    screenshots: [],
  },
  {
    num: "02",
    title: "ARCTIC VAULT",
    desc: "Personal finance tracker for Android with 15+ screens. Track transactions, set budgets, plan financial goals, manage debts, and get bill reminders — all offline-first with a Room database and Jetpack Compose UI.",
    tags: ["Kotlin", "Jetpack Compose", "Room", "Firebase"],
    img: "/images/projects/arcticvault.svg",
    github: "https://github.com/ExoticPengy/ArcticVault",
    involvements: [
      "Built 6 Room entities (transactions, budgets, goals, debts, reminders, categories) with full CRUD via repository pattern",
      "Implemented MVVM architecture with Flow-based reactive ViewModels across 15+ Compose screens",
      "Integrated Firebase Authentication for email/password sign-in with navigation routing",
    ],
    stats: [
      { value: "15+", label: "SCREENS" },
      { value: "6", label: "DB ENTITIES" },
      { value: "OFFLINE", label: "FIRST" },
    ],
    stack: [
      { name: "Kotlin", role: "language" },
      { name: "Jetpack Compose", role: "UI" },
      { name: "Material 3", role: "design" },
      { name: "Room", role: "database" },
      { name: "Firebase Auth", role: "auth" },
      { name: "yCharts", role: "charts" },
    ],
    features: [
      "Transaction tracking with categories, dates, and descriptions",
      "Yearly budgeting with spend-vs-target monitoring",
      "Financial goals with milestones and progress",
      "Debt management with rates, schedules, and balances",
      "Recurring bill reminders",
      "Spending analysis with interactive charts",
    ],
    screenshots: [],
  },
  {
    num: "03",
    title: "H & MAYBE",
    desc: "Full-stack fashion e-commerce app with Stripe checkout, order management, and an admin panel. Browse clothing, add to cart, pay with card, get email receipts — 130 commits across customer and admin flows.",
    tags: ["PHP", "Stripe", "MySQL", "E-COMMERCE"],
    img: "/images/projects/handmaybe.svg",
    github: "https://github.com/ExoticPengy/HAndMaybe",
    involvements: [
      "Implemented Stripe Checkout Sessions in MYR with receipt emails via PHPMailer",
      "Designed 12-table MySQL schema covering products, variations, cart, orders, and auth tokens",
      "Built admin panel for product/category/order CRUD and role-based access control",
    ],
    stats: [
      { value: "130", label: "COMMITS" },
      { value: "12", label: "DB TABLES" },
      { value: "9", label: "PRODUCTS" },
    ],
    stack: [
      { name: "PHP", role: "backend" },
      { name: "MySQL", role: "database" },
      { name: "Stripe", role: "payments" },
      { name: "PHPMailer", role: "email" },
      { name: "jQuery", role: "frontend" },
    ],
    features: [
      "Stripe Checkout in Malaysian Ringgit with email receipts",
      "Product variations (size, colour, stock) per item",
      "Shopping cart and order history with tracking",
      "Email verification and password reset flows",
      "Full admin panel: product, category, and order CRUD",
    ],
    screenshots: [],
  },
  {
    num: "04",
    title: "FYP API",
    desc: "EV charging station recommendation engine — FastAPI microservice with a trained ML model. Enter a trip route, get the best charger stop ranked by detour, cost, and predicted charging time.",
    tags: ["Python", "FastAPI", "scikit-learn", "ML"],
    img: "/images/projects/fyp-api.svg",
    github: "https://github.com/ExoticPengy/FYP-API",
    involvements: [
      "Built a 3-tier charger search algorithm (standard midpoint → emergency fallback → absolute closest)",
      "Trained an ML regression model to predict charging time and integrated it via joblib",
      "Integrated Google Maps Directions API for route polyline, distance, and duration",
    ],
    stats: [
      { value: "3-TIER", label: "SEARCH" },
      { value: "18", label: "STATIONS" },
      { value: "ML", label: "MODEL" },
    ],
    stack: [
      { name: "Python", role: "language" },
      { name: "FastAPI", role: "framework" },
      { name: "scikit-learn", role: "ML" },
      { name: "PostgreSQL", role: "database" },
      { name: "Google Maps", role: "routing" },
    ],
    features: [
      "ML-predicted charging time per stop and battery",
      "3-tier charger search with emergency fallbacks",
      "Cost estimation in MYR by connector and power",
      "Range-aware filtering on safe driveable distance",
      "Real route data from Google Maps Directions API",
      "Top-5 ranking by detour, availability, and power",
    ],
    screenshots: [],
  },
  {
    num: "05",
    title: "AI IMAGE GENERATOR",
    desc: "Browser-based AI image generation tool with a Node.js backend. Deployed and live on Vercel — enter a prompt, get an AI-generated image back through a custom server pipeline.",
    tags: ["JavaScript", "Node.js", "AI", "VERCEL"],
    img: "/images/projects/ai-image-generator.png",
    github: "https://github.com/ExoticPengy/AI-image-generator",
    live: "https://ai-image-generator.exoticpengy.me",
    involvements: [
      "Wired up a Node.js backend to an AI image generation API",
      "Built the client-side prompt-to-image flow with vanilla JavaScript",
      "Deployed to Vercel for a publicly accessible live demo",
    ],
    stats: [
      { value: "ASYNC", label: "JOB QUEUE" },
      { value: "9", label: "API ROUTES" },
      { value: "LIVE", label: "DEPLOYED" },
    ],
    stack: [
      { name: "Next.js 15", role: "framework" },
      { name: "Supabase", role: "backend" },
      { name: "OpenAI", role: "AI" },
      { name: "Stripe", role: "billing" },
      { name: "Vercel", role: "hosting" },
    ],
    features: [
      "Google sign-in with a credit-based usage system",
      "Prompt-to-image generation via OpenAI",
      "Edit studio with presets and image import",
      "Monthly Stripe subscription that refills credits",
      "Async job queue with a Supabase Edge worker",
    ],
    screenshots: [],
  },
  {
    num: "06",
    title: "PROFILES · SVELTEKIT",
    desc: "Link-in-bio profile builder — like Linktree — built with SvelteKit. Google sign-in, claim a username, upload a photo, and manage social links with drag-and-drop reordering. Deployed on Vercel.",
    tags: ["SvelteKit", "TypeScript", "Firebase", "Vercel"],
    img: "/images/projects/profiles-sveltekit.png",
    github: "https://github.com/ExoticPengy/Profiles-Sveltekit",
    live: "https://profiles.exoticpengy.me",
    favicon: "/images/profiles-favicon.png",
    involvements: [
      "Built username registration with debounced Firestore availability checks and atomic batch writes",
      "Implemented profile editing with drag-and-drop link reordering and public/private toggle",
      "Set up Firebase Authentication with server-side session cookies for SSR-protected routes",
    ],
    stats: [
      { value: "8", label: "ROUTES" },
      { value: "SSR", label: "AUTH" },
      { value: "LIVE", label: "DEPLOYED" },
    ],
    stack: [
      { name: "SvelteKit 2", role: "framework" },
      { name: "TypeScript", role: "language" },
      { name: "Tailwind + DaisyUI", role: "styling" },
      { name: "Firebase", role: "backend" },
      { name: "Vercel", role: "hosting" },
    ],
    features: [
      "Google sign-in with server-side session cookies",
      "Unique username claim with live availability checks",
      "Drag-and-drop link reordering",
      "Profile photo upload with live preview",
      "Public/private publish toggle and bio editor",
    ],
    screenshots: [],
  },
  {
    num: "07",
    title: "BLACKJACK",
    desc: "Command-line Blackjack simulation written in C++. A compact, self-contained game — hit, stand, and play against the dealer right from the terminal.",
    tags: ["C++", "CLI", "GAME"],
    img: "/images/projects/blackjack.svg",
    github: "https://github.com/ExoticPengy/Blackjack",
    involvements: [
      "Implemented full blackjack game logic — dealing, hitting, standing, and win conditions",
      "Built as a single-file C++ program with no external dependencies",
    ],
    stats: [
      { value: "1", label: "SOURCE FILE" },
      { value: "0", label: "DEPENDENCIES" },
      { value: "C++", label: "NATIVE" },
    ],
    stack: [
      { name: "C++", role: "language" },
      { name: "<random>", role: "RNG (Mersenne Twister)" },
    ],
    features: [
      "Full hit/stand gameplay loop",
      "Blackjack (natural 21) detection",
      "Smart ace handling — valued at 1 or 11",
      "Dealer AI that draws until it beats you",
      "Play-again loop with a fresh deck each round",
    ],
    screenshots: [],
  },
  {
    num: "08",
    title: "TIMESYNC",
    desc: "Scheduling coordination tool for finding the best meeting time across groups. Each person marks availability on a 7×24 grid — the heatmap reveals overlaps and recommends top 3 meeting slots.",
    tags: ["JavaScript", "Vite", "D3.js", "SCHEDULING"],
    img: "/images/projects/timesync.png",
    github: "https://github.com/ExoticPengy/timesync",
    involvements: [
      "Built a multi-person availability grid with drag-to-select interaction",
      "Implemented heatmap aggregation and a window-sliding algorithm for meeting time recommendations",
      "Designed a dark glassmorphism UI with CSS backdrop-blur and custom animations",
    ],
    stats: [
      { value: "7×24", label: "GRID" },
      { value: "TOP-3", label: "SLOTS" },
      { value: "NO", label: "BACKEND" },
    ],
    stack: [
      { name: "JavaScript", role: "frontend" },
      { name: "Vite", role: "build" },
      { name: "Custom CSS", role: "styling" },
      { name: "Observer pattern", role: "state" },
    ],
    features: [
      "Per-person availability grids",
      "Drag-to-select hour blocks",
      "Live group heatmap of overlaps",
      "Top-3 meeting-slot recommendations",
      "Weekly or specific date-range modes",
    ],
    screenshots: [],
  },
  {
    num: "09",
    title: "HEALTHLENS",
    desc: "Medical charges dashboard visualizing the classic insurance dataset. Scatter plot, bar chart, box plot, and histogram built with D3.js — animated entry transitions and hover effects via anime.js. Deployed on Netlify.",
    tags: ["D3.js", "anime.js", "Vite", "Netlify"],
    img: "/images/projects/healthlens.png",
    github: "https://github.com/ExoticPengy/data-visualization",
    involvements: [
      "Built 4 D3.js chart types from scratch — scatter, bar, box plot, and histogram — all from CSV data",
      "Choreographed anime.js timelines for staggered entry animations across KPIs and charts",
      "Authored a visualization plan document defining layout, color strategy, and interactivity",
    ],
    stats: [
      { value: "1,338", label: "RECORDS" },
      { value: "4", label: "CHART TYPES" },
      { value: "LIVE", label: "DEPLOYED" },
    ],
    stack: [
      { name: "D3.js v7", role: "visualization" },
      { name: "anime.js v4", role: "animation" },
      { name: "Vite", role: "build" },
      { name: "Netlify", role: "hosting" },
    ],
    features: [
      "Scatter plot — age vs. charges by smoking status",
      "Bar chart — average charges by region",
      "Box plot — smokers vs. non-smokers",
      "Histogram — BMI distribution by threshold",
      "Animated entry transitions and hover effects",
    ],
    screenshots: [],
  },
];

const TRANSITIONS = ["tear", "mosaic", "blinds", "slash", "cascade"] as const;
type Transition = (typeof TRANSITIONS)[number];

const TRANSITION_TIMINGS: Record<Transition, number> = {
  tear: 1300,
  mosaic: 950,
  blinds: 1300,
  slash: 900,
  cascade: 1200,
};

function pickTransition(): Transition {
  return TRANSITIONS[Math.floor(Math.random() * TRANSITIONS.length)];
}

export default function Projects({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<ProjectData | null>(null);
  const [animating, setAnimating] = useState(false);
  const [transition, setTransition] = useState<Transition>("tear");
  const [exiting, setExiting] = useState(false);

  const handleSelect = useCallback((p: ProjectData) => {
    click(900);
    whoosh(0.6);
    const t = pickTransition();
    setTransition(t);
    setSelected(p);
    setAnimating(true);
    setTimeout(() => setAnimating(false), TRANSITION_TIMINGS[t]);
  }, []);

  const handleBack = useCallback(() => {
    click(440);
    whoosh(0.4);
    setExiting(true);
    setTimeout(() => {
      setSelected(null);
      setExiting(false);
    }, 300);
  }, []);

  let overlay: React.ReactNode = null;
  if (animating) {
    switch (transition) {
      case "tear":
        overlay = (
          <div className="poke-overlay" style={{ display: "flex", flexDirection: "column" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="tear-strip tearing" />
            ))}
          </div>
        );
        break;
      case "mosaic":
        overlay = (
          <div
            className="poke-overlay"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(3, 1fr)",
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="mosaic-tile shattering" />
            ))}
          </div>
        );
        break;
      case "blinds":
        overlay = (
          <div className="poke-overlay" style={{ display: "flex", flexDirection: "row" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="blind-strip opening" />
            ))}
          </div>
        );
        break;
      case "slash":
        overlay = (
          <div className="poke-overlay">
            <div className="slash-half top slashing" />
            <div className="slash-half bottom slashing" />
          </div>
        );
        break;
      case "cascade":
        overlay = (
          <div className="poke-overlay" style={{ display: "flex", flexDirection: "column" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="cascade-strip falling" />
            ))}
          </div>
        );
        break;
    }
  }

  return (
    <SectionShell num="02" title="STAGES" ghost="WORK" onBack={onBack} overlay={overlay}>
      <div className={`project-detail-wrapper ${selected ? "active" : ""} ${exiting ? "exiting" : ""}`}>
        {selected ? (
          <ProjectDetail project={selected} onBack={handleBack} exiting={exiting} />
        ) : (
          <div className="projects-grid">
            {PROJECTS.map((p, i) => (
              <div
                key={p.num}
                className={[
                  "project-card",
                  !animating ? `reveal d${i + 1}` : "",
                ].filter(Boolean).join(" ")}
                onClick={() => !animating && handleSelect(p)}
                role="button"
                tabIndex={animating ? -1 : 0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !animating) handleSelect(p);
                }}
              >
                <div className="project-img">
                  <img src={p.img} alt={p.title} className="project-cover" />
                </div>
                <div className="project-body">
                  <div className="project-num">STAGE {p.num} · CLEARED</div>
                  <h3 className="project-title">{p.title}</h3>
                  <p className="project-desc">{p.desc}</p>
                  <div className="project-tags">
                    {p.tags.map((tg) => (
                      <span key={tg} className="tag">{tg}</span>
                    ))}
                  </div>
                  {p.stats && p.stats.length > 0 && (
                    <div className="project-card-stats">
                      {p.stats.slice(0, 3).map((s) => (
                        <div key={s.label} className="card-stat">
                          <span className="card-stat-value">{s.value}</span>
                          <span className="card-stat-label">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="project-card-hint">PRESS ENTER · VIEW DETAILS</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}
