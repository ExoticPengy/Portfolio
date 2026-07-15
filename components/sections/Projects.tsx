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
    img: "/images/projects/tiandi-logo.png",
    coverAspect: 1.422,
    coverFit: "contain",
    coverBg: "#F7F2EA", // warm cream — matches tiandi.app, lifts the red/white mark
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
      { name: "Cloudflare Pages", role: "hosting" },
    ],
    features: [
      "Multi-page site: home, about, services, training, gallery, blog, FAQ, contact",
      "Booking and contact flow to reserve performances",
      "Admin panel with Supabase-backed gallery and blog management",
      "Testimonials, team, and FAQ sections",
    ],
    screenshots: [
      "/images/projects/tiandi.png",
      "/images/projects/tiandi-services.png",
      "/images/projects/tiandi-gallery.png",
      "/images/projects/tiandi-contact.png",
    ],
  },
  {
    num: "02",
    title: "DREAMFRAME",
    desc: "Credit-based AI image SaaS — sign in with Google, spend credits to generate and edit images via OpenAI, and top up with a monthly Stripe subscription. Async job queue, 3D landing scene, live on Vercel.",
    tags: ["Next.js", "OpenAI", "Stripe", "VERCEL"],
    img: "/images/projects/dreamframe-logo.png",
    coverAspect: 1.422,
    coverFit: "contain",
    coverBg: "#F2F0FA", // pale lavender behind the purple sparkle mark
    live: "https://ai-image-generator.exoticpengy.me",
    involvements: [
      "Built a credit-based generation system with quality tiers (1/2/3 credits) and Stripe subscription top-ups",
      "Implemented an async job queue with a Supabase Edge Function worker and status polling",
      "Added an edit studio, prompt enhancer, and a 3D landing scene with Three.js + GSAP",
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
      { name: "Three.js", role: "3D" },
      { name: "GSAP", role: "animation" },
      { name: "Vercel", role: "hosting" },
    ],
    features: [
      "Google sign-in with a credit-based usage system",
      "Prompt-to-image generation via OpenAI, with a prompt enhancer",
      "Quality tiers — low / medium / high cost 1 / 2 / 3 credits",
      "Edit studio with presets and image import",
      "Gallery of past generations served via signed URLs",
      "Monthly Stripe subscription with a billing portal to manage or cancel",
      "Async job queue with a Supabase Edge worker",
    ],
    screenshots: [
      "/images/projects/dreamframe.png",
      "/images/projects/dreamframe-howitworks.png",
      "/images/projects/dreamframe-cta.png",
    ],
  },
  {
    num: "03",
    title: "TIMESYNC",
    desc: "Scheduling coordination tool for finding the best meeting time across groups. Share a sync link, each person marks their hours on a day × hour grid, and a live Firebase-backed heatmap overlays everyone's input to surface the top 3 slots.",
    tags: ["JavaScript", "Vite", "Firebase", "SCHEDULING"],
    img: "/images/projects/timesync.png",
    coverAspect: 1.103,
    coverBg: "#FAFAFA", // sampled edge of the screenshot
    github: "https://github.com/ExoticPengy/timesync",
    live: "https://timesync.exoticpengy.me",
    involvements: [
      "Built a multi-person availability grid with drag-to-select interaction, week and day-by-day layouts",
      "Implemented heatmap aggregation and a window-sliding algorithm for meeting time recommendations",
      "Wired Firebase Realtime Database for live shared syncs — no accounts, no server code",
    ],
    stats: [
      { value: "LIVE", label: "SYNC" },
      { value: "TOP-3", label: "SLOTS" },
      { value: "0", label: "FRAMEWORKS" },
    ],
    stack: [
      { name: "JavaScript (ES modules)", role: "frontend" },
      { name: "Vite", role: "build" },
      { name: "Custom CSS", role: "styling" },
      { name: "Firebase RTDB", role: "backend" },
    ],
    features: [
      "Shared sync links — participants join by name, no accounts",
      "Drag-to-select hour blocks with a live group heatmap",
      "Top-3 recommendations in 'best effort' or 'everyone free' mode",
      "Adjustable 1–8 hour meeting duration",
      "Weekly recurring or multi-month calendar modes",
      "Doodle-style day polls and editable post-creation settings",
    ],
    screenshots: [
      "/images/projects/timesync-monthmode.png",
      "/images/projects/timesync-daypoll.png",
    ],
  },
  {
    num: "04",
    title: "PROFILES · SVELTEKIT",
    desc: "Link-in-bio profile builder — like Linktree — built with SvelteKit. Google sign-in, claim a username, upload a photo, and manage social links with drag-and-drop reordering. Deployed on Vercel.",
    tags: ["SvelteKit", "TypeScript", "Firebase", "Vercel"],
    img: "/images/projects/profiles-sveltekit.png",
    coverAspect: 1.488,
    coverBg: "#0F0D18", // sampled edge of the screenshot
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
    screenshots: [
      "/images/projects/profiles-profile.png",
      "/images/projects/profiles-login.png",
    ],
  },
  {
    num: "05",
    title: "H & MAYBE",
    desc: "Full-stack fashion e-commerce app built on plain PHP — no framework, just a clean layered structure. Browse clothing by category, add to cart, pay with Stripe, get email receipts, and track orders, with an admin panel behind it all.",
    tags: ["PHP", "Stripe", "MySQL", "E-COMMERCE"],
    img: "/images/projects/handmaybe-logo.png",
    coverAspect: 2.019,
    coverFit: "contain",
    coverBg: "#FFFFFF", // storefront white behind the H&M-red script
    github: "https://github.com/ExoticPengy/HAndMaybe",
    involvements: [
      "Implemented Stripe Checkout Sessions in MYR with receipt emails via PHPMailer",
      "Designed the MySQL schema covering users, products, variations, cart, orders, addresses, and auth tokens, queried through PDO prepared statements",
      "Built admin panel for product/category/order CRUD and role-based access control",
    ],
    stats: [
      { value: "132", label: "COMMITS" },
      { value: "12", label: "DB TABLES" },
      { value: "9", label: "PRODUCTS" },
    ],
    stack: [
      { name: "PHP (no framework)", role: "backend" },
      { name: "MySQL + PDO", role: "database" },
      { name: "Stripe", role: "payments" },
      { name: "PHPMailer", role: "email" },
      { name: "jQuery", role: "frontend" },
      { name: "Custom CSS", role: "styling" },
    ],
    features: [
      "Stripe Checkout in Malaysian Ringgit with email receipts",
      "Product variations (size, colour, stock) per item",
      "Shopping cart and order history with delivery tracking",
      "Saved shipping addresses at checkout",
      "Email verification and password reset flows",
      "Full admin panel: product, category, and order CRUD",
    ],
    screenshots: [
      "/images/projects/handmaybe-product.png",
      "/images/projects/handmaybe-cart.png",
      "/images/projects/handmaybe-order.png",
    ],
  },
  {
    num: "06",
    title: "HEALTHLENS",
    desc: "Medical charges dashboard visualizing the classic insurance dataset. Scatter plot, bar chart, box plot, and histogram built with D3.js — animated entry transitions and hover effects via anime.js. Deployed on Netlify.",
    tags: ["D3.js", "anime.js", "Vite", "Netlify"],
    img: "/images/projects/healthlens.png",
    coverAspect: 0.926,
    coverBg: "#0F172A", // sampled edge of the screenshot
    github: "https://github.com/ExoticPengy/data-visualization",
    live: "https://pengyhealthlens.netlify.app",
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
    screenshots: [
      "/images/projects/healthlens-kpis.png",
    ],
  },
  {
    num: "07",
    title: "FOODTRUST",
    desc: "Browser extension that brings transparency to Google Maps restaurant reviews. Scans a listing in real time, flags suspicious reviews with an AI-written reason and probability, and paints an overall trust score onto the page. Built at the Great AI Hackathon 2025 with Team Penguining.",
    tags: ["Python", "scikit-learn", "AWS Bedrock", "HACKATHON"],
    img: "/images/projects/foodtrust-analysis.png",
    coverAspect: 1.189,
    coverBg: "#291A29", // sampled edge of the screenshot
    github: "https://github.com/ExoticPengy/FoodTrust",
    involvements: [
      "Built the review preprocessing pipeline in SageMaker Studio — text cleaning, train/test split, and S3 dataset staging",
      "Engineered reviewer-behaviour features for account profiling — review velocity per active day, lifetime review count, and Local Guide status",
      "Trained the review models on 33K labelled reviews — a TF-IDF + logistic-regression classifier and TF-IDF + K-Means reviewer clustering, exported with joblib",
    ],
    stats: [
      { value: "33K", label: "LABELLED REVIEWS" },
      { value: "K-MEANS", label: "+ TF-IDF" },
      { value: "2025", label: "HACKATHON" },
    ],
    stack: [
      { name: "Python", role: "language" },
      { name: "scikit-learn", role: "ML" },
      { name: "NLTK", role: "text" },
      { name: "SageMaker", role: "training" },
      { name: "AWS Bedrock", role: "review analysis" },
      { name: "Lambda + API Gateway", role: "serverless backend" },
      { name: "JavaScript", role: "extension" },
    ],
    features: [
      "Overall trust score rendered straight onto the Google Maps listing",
      "Per-review AI verdict — category, reasoning, and suspicion probability",
      "Reviewer profiling by review velocity and Local Guide status",
      "One-click scan of a restaurant's reviews from a floating button",
      "Serverless AWS backend — Lambda, API Gateway, and S3",
    ],
    screenshots: [
      "/images/projects/foodtrust-extension.png",
      "/images/projects/foodtrust-architecture.png",
    ],
  },
  {
    num: "08",
    title: "FYP API",
    desc: "EV charging station recommendation engine — FastAPI microservice with a trained ML model. Enter a trip route, get the best charger stop ranked by detour, cost, and predicted charging time.",
    tags: ["Python", "FastAPI", "scikit-learn", "ML"],
    img: "/images/projects/fyp-api-logo.png",
    coverAspect: 0.9, // clamped: phone shots are 0.449, which would force a 1365px hero
    coverFit: "contain",
    coverBg: "#F2FBF5", // soft mint, complements the green EV mark
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
    screenshots: [
      "/images/projects/fyp-api-newtrip.png",
      "/images/projects/fyp-api-route.png",
    ],
  },
  {
    num: "09",
    title: "ARCTIC VAULT",
    desc: "Personal finance tracker for Android with 15+ screens. Track transactions, set budgets, plan financial goals, manage debts, and get bill reminders — all offline-first with a Room database and Jetpack Compose UI.",
    tags: ["Kotlin", "Jetpack Compose", "Room", "Firebase"],
    img: "/images/projects/arcticvault.svg",
    coverAspect: 1.6,
    coverBg: "#0D1117", // matches the placeholder gradient
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
    num: "10",
    title: "BLACKJACK",
    desc: "Command-line Blackjack simulation written in C++. A compact, self-contained game — hit, stand, and play against the dealer right from the terminal.",
    tags: ["C++", "CLI", "GAME"],
    img: "/images/projects/blackjack.svg",
    coverAspect: 1.6,
    coverBg: "#0D1117", // matches the placeholder gradient
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
                  <img
                    src={p.img}
                    alt={p.title}
                    style={p.coverBg ? { background: p.coverBg } : undefined}
                    className={`project-cover${p.coverFit === "contain" ? " is-contain" : ""}`}
                  />
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
