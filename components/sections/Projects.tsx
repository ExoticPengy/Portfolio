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
      "Designed 10-table MySQL schema covering products, variations, cart, orders, and auth tokens",
      "Built admin panel for product/category/order CRUD and role-based access control",
    ],
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
