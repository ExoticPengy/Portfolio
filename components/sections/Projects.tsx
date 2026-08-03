import { useState, useCallback, useEffect } from "react";
import SectionShell from "./SectionShell";
import ProjectDetail from "./ProjectDetail";
import { whoosh, click } from "@/lib/audio";
import { parseHash, formatHash, slugify } from "@/lib/route";
import type { ProjectData } from "@/lib/types";

const PROJECTS: ProjectData[] = [
  {
    num: "01",
    title: "TIAN DI",
    desc: "Lion and dragon dance troupe website. Landing page with booking, services, gallery, and contact sections. Live at tiandi.app with 500+ performances under their belt.",
    tags: ["Next.js", "Tailwind CSS", "TypeScript", "LIVE"],
    img: "/images/projects/tiandi-logo.png",
    coverAspect: 1.422,
    coverFit: "contain",
    coverBg: "#F7F2EA", // warm cream, matches tiandi.app, lifts the red/white mark
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
    title: "BINGO",
    status: "GRINDING",
    desc: "Conversational BI platform. Ask your warehouse a question in plain language and get charts, findings, and scheduled briefings back. FastAPI + Nuxt 4 + LangGraph, with a multi-agent system over PostgreSQL, MySQL, and BigQuery. Open-source core, live at thebingo.ai. I'm a contributor on the team.",
    tags: ["Python", "FastAPI", "LangGraph", "LIVE"],
    img: "/images/projects/bingo-logo.png",
    coverAspect: 1.6,
    coverFit: "contain",
    coverBg: "#F4F1FA", // pale lavender behind the purple wordmark
    github: "https://github.com/thebingoai/thebingoai",
    live: "https://thebingo.ai",
    favicon: "/images/bingo-favicon.png",
    involvements: [
      "Built the BigQuery connector plugin with sharded and partitioned table recognition, GA4 event unnesting, and permission checks",
      "Shipped the Brief Me feature end to end: scheduled briefings, PDF export with segmenting and watermarking, and share links",
      "Owned the credit/billing path: transactional debits persisted before charging, rollback and auto-refund on failed or undelivered turns, recurring top-up splits, and trial/workspace expiration",
      "Added the MySQL + DuckDB pipeline with T-n cron scheduling, plus @mention, Langfuse tracing, and GA4 tagging",
    ],
    stats: [
      { value: "89", label: "MY COMMITS" },
      { value: "5", label: "AI AGENTS" },
      { value: "LIVE", label: "DEPLOYED" },
    ],
    stack: [
      { name: "FastAPI", role: "backend" },
      { name: "Nuxt 4 + Vue", role: "frontend" },
      { name: "LangGraph", role: "agents + RAG" },
      { name: "PostgreSQL", role: "primary DB" },
      { name: "Qdrant", role: "vector store" },
      { name: "Redis + Celery", role: "queue + jobs" },
      { name: "OpenAI / Anthropic / Ollama", role: "LLM providers" },
      { name: "Docker Compose", role: "infra" },
    ],
    features: [
      "Natural-language questions answered with generated SQL, charts, and findings",
      "Drag-and-drop dashboard widgets (GridStack) with live data",
      "Real-time WebSocket chat with RAG over indexed documents",
      "Multi-agent orchestration across data, dashboard, RAG, and monitor agents",
      "Connectors for PostgreSQL, MySQL, and BigQuery",
      "Scheduled briefings delivered as segmented PDF exports",
      "Credit-based billing with refunds on failed turns",
      "Swappable LLM providers: OpenAI, Anthropic, or self-hosted Ollama",
    ],
    collaborators: [
      { name: "Edmund Hee", url: "https://github.com/EdmundHee", role: "Team Lead", icon: "/images/edmundhee-avatar.png" },
      { name: "notjaman", url: "https://github.com/notjaman", role: "Teammate", icon: "/images/notjaman-avatar.png" },
      { name: "Kent Chong", url: "https://github.com/Kent-Chong", role: "Teammate", icon: "/images/kent-chong-avatar.png" },
    ],
    screenshots: [
      "/images/projects/bingo.png",
    ],
  },
  {
    num: "03",
    title: "DREAMFRAME",
    status: "GRINDING",
    desc: "Credit-based AI image SaaS. Sign in with Google, spend credits to generate and edit images via OpenAI, or bring your own key and skip the meter. Priority job queue, markdown prompt editor, 3D landing scene, live on Vercel.",
    tags: ["Next.js", "OpenAI", "Stripe", "VERCEL"],
    img: "/images/projects/dreamframe-logo.png",
    coverAspect: 1.422,
    coverFit: "contain",
    coverBg: "#F2F0FA", // pale lavender behind the purple sparkle mark
    live: "https://ai-image-generator.exoticpengy.me",
    favicon: "/images/dreamframe-favicon.png",
    involvements: [
      "Built a credit-based pricing system: COGS pegged to the OpenAI price list, markup as one constant, charged transactionally with the job insert",
      "Implemented a priority job queue with a Supabase Edge Function worker, in-flight caps, auto-refunds, and stale-job rescue",
      "Added BYOK (encrypted at rest), an edit studio, a markdown prompt editor, and a 3D landing scene with Three.js + GSAP",
    ],
    stats: [
      { value: "300", label: "FREE CREDITS" },
      { value: "10", label: "API ROUTES" },
      { value: "LIVE", label: "DEPLOYED" },
    ],
    stack: [
      { name: "Next.js 15", role: "framework" },
      { name: "Supabase", role: "backend" },
      { name: "gpt-image-2", role: "images" },
      { name: "gpt-5-mini", role: "prompts" },
      { name: "Stripe", role: "billing" },
      { name: "Three.js", role: "3D" },
      { name: "GSAP", role: "animation" },
      { name: "Vitest", role: "testing" },
      { name: "Vercel", role: "hosting" },
    ],
    features: [
      "Google sign-in with 300 free credits on signup",
      "Quality tiers: low / medium / high cost 15 / 150 / 600 credits",
      "Bring your own OpenAI key, encrypted at rest, and run jobs for free",
      "Edit studio with up to 4 labelled inputs, categorised presets, and gallery import",
      "Image options: aspect ratio, transparent background, detail preservation",
      "Markdown prompt editor with live preview, plus ✨ Enhance to structure a rough prompt",
      "Gallery of past generations served via short-lived signed URLs",
      "Monthly Stripe plan refills credits each cycle, cancel via the billing portal",
      "Priority job queue with in-flight caps, daily abuse guards, and stale-job rescue",
    ],
    screenshots: [
      "/images/projects/dreamframe.png",
      "/images/projects/dreamframe-howitworks.png",
      "/images/projects/dreamframe-cta.png",
    ],
  },
  {
    num: "04",
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
      "Wired Firebase Realtime Database for live shared syncs, with no accounts and no server code",
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
      "Shared sync links, participants join by name, no accounts",
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
    num: "05",
    title: "PROFILES · SVELTEKIT",
    desc: "Link-in-bio profile builder, like Linktree, built with SvelteKit. Google sign-in, claim a username, upload a photo, and manage social links with drag-and-drop reordering. Deployed on Vercel.",
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
    num: "06",
    title: "H & MAYBE",
    desc: "Full-stack fashion e-commerce app built on plain PHP, no framework, just a clean layered structure. Browse clothing by category, add to cart, pay with Stripe, get email receipts, and track orders, with an admin panel behind it all.",
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
    collaborators: [
      { name: "Elaine", url: "https://sillycookie.me", role: "Teammate", icon: "/images/sillycookie-favicon.png" },
    ],
    screenshots: [
      "/images/projects/handmaybe-product.png",
      "/images/projects/handmaybe-cart.png",
      "/images/projects/handmaybe-order.png",
    ],
  },
  {
    num: "07",
    title: "HEALTHLENS",
    desc: "Medical charges dashboard visualizing the classic insurance dataset. Scatter plot, bar chart, box plot, and histogram built with D3.js, with animated entry transitions and hover effects via anime.js. Deployed on Netlify.",
    tags: ["D3.js", "anime.js", "Vite", "Netlify"],
    img: "/images/projects/healthlens.png",
    coverAspect: 0.926,
    coverBg: "#0F172A", // sampled edge of the screenshot
    github: "https://github.com/ExoticPengy/data-visualization",
    live: "https://pengyhealthlens.netlify.app",
    involvements: [
      "Built 4 D3.js chart types from scratch (scatter, bar, box plot, and histogram) all from CSV data",
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
      "Scatter plot: age vs. charges by smoking status",
      "Bar chart: average charges by region",
      "Box plot: smokers vs. non-smokers",
      "Histogram: BMI distribution by threshold",
      "Animated entry transitions and hover effects",
    ],
    screenshots: [
      "/images/projects/healthlens-kpis.png",
    ],
  },
  {
    num: "08",
    title: "FOODTRUST",
    desc: "Browser extension that brings transparency to Google Maps restaurant reviews. Scans a listing in real time, flags suspicious reviews with an AI-written reason and probability, and paints an overall trust score onto the page. Built at the Great AI Hackathon 2025 with Team Penguining.",
    tags: ["Python", "scikit-learn", "AWS Bedrock", "HACKATHON"],
    img: "/images/projects/foodtrust-analysis.png",
    coverAspect: 1.189,
    coverBg: "#291A29", // sampled edge of the screenshot
    github: "https://github.com/ExoticPengy/FoodTrust",
    involvements: [
      "Built the review preprocessing pipeline in SageMaker Studio: text cleaning, train/test split, and S3 dataset staging",
      "Engineered reviewer-behaviour features for account profiling: review velocity per active day, lifetime review count, and Local Guide status",
      "Trained the review models on 33K labelled reviews, a TF-IDF + logistic-regression classifier and TF-IDF + K-Means reviewer clustering, exported with joblib",
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
      "Per-review AI verdict: category, reasoning, and suspicion probability",
      "Reviewer profiling by review velocity and Local Guide status",
      "One-click scan of a restaurant's reviews from a floating button",
      "Serverless AWS backend: Lambda, API Gateway, and S3",
    ],
    collaborators: [
      { name: "Elaine", url: "https://sillycookie.me", role: "Team Penguining", icon: "/images/sillycookie-favicon.png" },
    ],
    screenshots: [
      "/images/projects/foodtrust-extension.png",
      "/images/projects/foodtrust-architecture.png",
    ],
  },
  {
    num: "09",
    title: "FYP API",
    desc: "EV charging station recommendation engine. FastAPI microservice with a trained ML model. Enter a trip route, get the best charger stop ranked by detour, cost, and predicted charging time.",
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
    num: "10",
    title: "ARCTIC VAULT",
    desc: "Personal finance tracker for Android with 15+ screens. Track transactions, set budgets, plan financial goals, manage debts, and get bill reminders, all offline-first with a Room database and Jetpack Compose UI.",
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

  // --- Hash route: this component owns the slug in #/projects/<slug>. ---
  // Stage owns the view segment; the two never write the same part.
  const [routeReady, setRouteReady] = useState(false);
  useEffect(() => {
    const apply = () => {
      const { view, slug } = parseHash(window.location.hash);
      if (view !== "projects") return; // leaving; Stage handles it
      const found = slug ? PROJECTS.find((p) => slugify(p.title) === slug) ?? null : null;
      setSelected(found); // deep link opens the detail directly, no transition
      setRouteReady(true); // batched with setSelected, so the writer sees the restored slug
    };
    apply(); // restore on mount
    window.addEventListener("hashchange", apply); // browser back/forward
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  useEffect(() => {
    // Gate on state, not a ref. See the same guard in Stage.tsx.
    if (!routeReady) return;
    if (parseHash(window.location.hash).view !== "projects") return;
    const next = formatHash("projects", selected ? slugify(selected.title) : null);
    if (window.location.hash !== next) window.location.hash = next;
  }, [selected, routeReady]);

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
                  <div className="project-num">STAGE {p.num} · {p.status ?? "CLEARED"}</div>
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
