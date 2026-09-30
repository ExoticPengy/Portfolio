import { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import SectionShell from "./SectionShell";
import ProjectDetail from "./ProjectDetail";
import PixelCanvas, { motionOk, type PixelHandle } from "../PixelCanvas";
import { whoosh, click } from "@/lib/audio";
import { parseHash, formatHash, slugify } from "@/lib/route";
import { WIPES } from "@/lib/pixels";
import type { ProjectData } from "@/lib/types";
import { unlock } from "@/hooks/useAchievements";

export const PROJECTS: ProjectData[] = [
  {
    num: "01",
    title: "TIAN DI",
    desc: "The online home of a lion and dragon dance troupe with 500+ performances behind them. Clients browse services and the gallery, then book a show. The troupe runs its own gallery and blog from an admin panel, no developer needed. Live at tiandi.app.",
    tags: ["Next.js", "Tailwind CSS", "TypeScript", "LIVE"],
    img: "/images/projects/tiandi-logo.webp",
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
      "Found on Google and by AI assistants: LocalBusiness + PerformingGroup structured data, a sitemap, and an llms.txt fact sheet",
      "Admin panel the troupe runs themselves: gallery, blog, and booking enquiries, no developer needed",
      "Drag-and-drop gallery ordering with optimistic saves and auto-scroll at the screen edge",
      "Large photos shrunk in the browser before upload, so posting from an event stays fast",
      "Show or hide any photo from the public gallery with one toggle",
      "Migrated from a Vite prototype to Next.js 16 on Cloudflare Pages",
    ],
    screenshots: [
      "/images/projects/tiandi.webp",
      "/images/projects/tiandi-services.webp",
      "/images/projects/tiandi-gallery.webp",
      "/images/projects/tiandi-contact.webp",
    ],
  },
  {
    num: "02",
    title: "BINGO",
    status: "GRINDING",
    desc: "An AI analyst that sits on top of your data warehouse. Ask in plain English and get SQL, charts, dashboards, and scheduled briefings, without your data ever going to the AI: the model only sees your schema and the question, and queries run read-only inside your own boundary. Works with PostgreSQL, MySQL, and BigQuery. Open-source core, live at thebingo.ai. I'm on the team.",
    tags: ["AI + BI", "LangGraph", "PRIVACY-FIRST", "LIVE"],
    img: "/images/projects/bingo-logo.webp",
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
      { value: "0", label: "ROWS SENT TO AI" },
      { value: "5", label: "AI AGENTS" },
      { value: "89", label: "MY COMMITS" },
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
      "Brief Me: scheduled AI briefings on your dashboards, with recommendations, exported as segmented, watermarked PDFs",
      "Share links that send a briefing outside the workspace, modularized and hardened with backend and frontend tests",
      "BigQuery connector that recognises sharded and partitioned tables, unnests GA4 events, and checks permissions first",
      "Dashboard Analyzer: type Analyze or hit the button and an AI sidebar explains what the dashboard is saying",
      "Loop detection that hard-stops a runaway agent and tells the user why, instead of a cryptic recursion error",
      "Billing that never charges for nothing: the turn is saved before the debit, failed or undelivered turns refund themselves",
      "MySQL to DuckDB pipelines on a T-n cron schedule, so dashboards read a fast copy instead of the live database",
      "Google Sheets connector that dashboards can mix with database connections",
      "@mentions to point the AI at a specific dashboard or connection",
      "Non-blocking CSV/XLSX uploads, profiled in the background and stored on GCS",
    ],
    collaborators: [
      { name: "Edmund Hee", url: "https://edmundhee.com", role: "Team Lead", icon: "/images/edmundhee-avatar.png" },
      { name: "Tan Ja Man", url: "https://tanjaman.com", role: "Teammate", icon: "/images/notjaman-avatar.png" },
      { name: "Kent Chong", url: "https://kentchong.com", role: "Teammate", icon: "/images/kent-chong-avatar.png" },
    ],
    screenshots: [
      "/images/projects/bingo.webp",
    ],
  },
  {
    num: "03",
    title: "DREAMFRAME",
    status: "GRINDING",
    desc: "AI image studio without the subscription trap. Pay per image in credits, or bring your own OpenAI key and pay nothing. Built like a real SaaS underneath: transactional billing with auto-refunds, a priority job queue, keys encrypted at rest, and Stripe plans. Live.",
    tags: ["Next.js", "OpenAI", "Stripe", "VERCEL"],
    img: "/images/projects/dreamframe-logo.webp",
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
      { value: "$0", label: "WITH YOUR KEY" },
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
      "One database transaction gates, charges, and queues each job: a request either gets a slot and pays, or does neither",
      "Failed jobs refund automatically, and jobs stuck over 12 minutes are rescued and refunded",
      "Bring your own OpenAI key, encrypted at rest, and generate for free",
      "Abuse guards: per-user and global daily caps, enforced in the same transaction as the charge",
      "Live credit estimate before you hit generate, priced from the OpenAI price list",
      "Edit studio with up to 4 labelled inputs, presets, and ✨ Enhance to restructure a rough prompt",
      "Transparent backgrounds, aspect ratios, and detail preservation, each mapped to a real gpt-image parameter",
      "Monthly Stripe plan refills credits each cycle",
      "Three.js + GSAP 3D landing scene",
    ],
    screenshots: [
      "/images/projects/dreamframe.webp",
      "/images/projects/dreamframe-howitworks.webp",
      "/images/projects/dreamframe-cta.webp",
    ],
  },
  {
    num: "04",
    title: "TIMESYNC",
    desc: "Ends the \"when is everyone free?\" group chat. Share one link, everyone paints their free hours, and a live heatmap picks the top 3 meeting slots. No accounts, no server code, and every change shows up for everyone in real time.",
    tags: ["JavaScript", "Vite", "Firebase", "SCHEDULING"],
    img: "/images/projects/timesync.webp",
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
      { value: "0", label: "SIGN-UPS" },
    ],
    stack: [
      { name: "JavaScript (ES modules)", role: "frontend" },
      { name: "Vite", role: "build" },
      { name: "Custom CSS", role: "styling" },
      { name: "Firebase RTDB", role: "backend" },
    ],
    features: [
      "Live group heatmap: everyone's marks merge in real time over Firebase",
      "Top-3 slots ranked by the lowest turnout across the whole meeting, so a slot only counts if people can stay for all of it",
      "Share a link and join by name: no accounts, no server code",
      "Drag-to-select hour blocks on a day × hour grid",
      "Weekly recurring or multi-month calendars, gaps allowed",
      "Doodle-style day polls when you only need a date",
      "Settings editable after creation without losing anyone's marks",
      "Core scheduling logic kept pure and unit-tested",
    ],
    screenshots: [
      "/images/projects/timesync-monthmode.webp",
      "/images/projects/timesync-daypoll.webp",
    ],
  },
  {
    num: "05",
    title: "PROFILES · SVELTEKIT",
    desc: "A Linktree of my own, built from scratch. Claim a username, add a photo, drag your links into order, and share one page. Server-side sessions keep private profiles private. SvelteKit and Firebase, live on Vercel.",
    tags: ["SvelteKit", "TypeScript", "Firebase", "Vercel"],
    img: "/images/projects/profiles-sveltekit.webp",
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
      "Server-side session cookies: protected pages are checked on the server before they render",
      "Claim a unique @handle, checked live as you type and saved in an atomic batch so no two people get it",
      "Drag-to-reorder links",
      "Photo upload with live preview and progress bar",
      "Server-validated bio and a public/private switch",
      "Icons for Twitter, YouTube, TikTok, LinkedIn, GitHub, or any custom URL",
    ],
    screenshots: [
      "/images/projects/profiles-profile.webp",
      "/images/projects/profiles-login.webp",
    ],
  },
  {
    num: "06",
    title: "H & MAYBE",
    desc: "A complete online store with no framework to lean on. Shoppers pick a size and colour, pay by Stripe in MYR, get an emailed receipt, and track delivery. Staff run products and orders from an admin panel. Plain PHP and MySQL, every query a prepared statement.",
    tags: ["PHP", "Stripe", "MySQL", "E-COMMERCE"],
    img: "/images/projects/handmaybe-logo.webp",
    coverAspect: 2.019,
    coverFit: "contain",
    coverBg: "#FFFFFF", // storefront white behind the H&M-red script
    github: "https://github.com/ExoticPengy/HAndMaybe",
    involvements: [
      "Built authentication end to end: sign-up, role-based admin and member login, remember-me tokens stored as SHA-256 hashes, email verification, and password reset",
      "Implemented Stripe Checkout Sessions in MYR with receipt emails via PHPMailer",
      "Built the cart, checkout, and order flow, plus drag-and-drop profile photo upload",
    ],
    stats: [
      { value: "50", label: "MY COMMITS" },
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
      "Stripe Checkout in MYR, followed by an emailed receipt",
      "Remember-me login with random tokens stored only as SHA-256 hashes, expired ones purged",
      "Email verification and password reset by token link",
      "One auth() guard for role-based admin and member pages",
      "Cart to checkout to order, with order tracking",
      "Drag-and-drop profile photo upload",
    ],
    collaborators: [
      { name: "Elaine", url: "https://sillycookie.me", role: "Teammate", icon: "/images/sillycookie-favicon.png" },
      { name: "Chea Ming Shen", url: "https://github.com/mingshen0118", role: "Teammate", icon: "/images/mingshen0118-avatar.png" },
    ],
    screenshots: [
      "/images/projects/handmaybe-product.webp",
      "/images/projects/handmaybe-cart.webp",
      "/images/projects/handmaybe-order.webp",
    ],
  },
  {
    num: "07",
    title: "HEALTHLENS",
    desc: "Why do smokers pay nearly 4x more for health insurance? This dashboard makes the answer obvious at a glance, plotting age, BMI, smoking, and region across 1,338 real records with hand-built D3.js charts and animated reveals.",
    tags: ["D3.js", "anime.js", "Vite", "Netlify"],
    img: "/images/projects/healthlens.webp",
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
      { value: "3.8x", label: "SMOKER COST" },
      { value: "4", label: "CHART TYPES" },
    ],
    stack: [
      { name: "D3.js v7", role: "visualization" },
      { name: "anime.js v4", role: "animation" },
      { name: "Vite", role: "build" },
      { name: "Netlify", role: "hosting" },
    ],
    features: [
      "The famous three-band split: age vs. charges, coloured by smoking status",
      "Box plot that puts the smoker cost gap side by side",
      "Raw SVG charts from D3 scales, bins, quantiles, and rollups, no chart library",
      "Staggered anime.js entry timelines with spring easing",
      "KPI cards: average charges, smoker share, mean BMI, record count",
      "BMI histogram colour-coded normal, overweight, and obese",
    ],
    screenshots: [
      "/images/projects/healthlens-kpis.webp",
    ],
  },
  {
    num: "08",
    title: "FOODTRUST",
    desc: "Fake reviews make star ratings meaningless. FoodTrust scans a Google Maps restaurant, flags suspicious reviews with an AI-written reason and probability, and paints a trust score onto the page. Models trained on 33K labelled reviews. Built at the Great AI Hackathon 2025 with Team Penguining.",
    tags: ["Python", "scikit-learn", "AWS Bedrock", "HACKATHON"],
    img: "/images/projects/foodtrust-analysis.webp",
    coverAspect: 1.189,
    coverBg: "#291A29", // sampled edge of the screenshot
    github: "https://github.com/ExoticPengy/FoodTrust",
    involvements: [
      "Built the review preprocessing pipeline in SageMaker Studio: text cleaning, train/test split, and S3 dataset staging",
      "Engineered reviewer-behaviour features for account profiling: review velocity per active day, lifetime review count, and Local Guide status",
      "Trained the review models on 33K labelled reviews, a TF-IDF + logistic-regression classifier and TF-IDF + K-Means reviewer clustering, exported with joblib",
    ],
    stats: [
      { value: "94%", label: "ACCURACY" },
      { value: "33K", label: "LABELLED REVIEWS" },
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
      "Fake-review classifier at 94.2% accuracy, catching 92% of fakes across 3,843 held-out reviews",
      "Trained on real Malaysian reviews written in mixed English and Malay",
      "Reviewer profiling: K-Means clusters 13K reviewers on text plus behaviour and flags accounts posting at suspicious speed",
      "Behaviour features: reviews per active day, lifetime review count, and Local Guide status",
      "SageMaker pipeline from raw CSV to S3 train/test sets to exported joblib models",
      "Models feed the team's extension, which paints a trust score onto Google Maps",
    ],
    collaborators: [
      { name: "Elaine", url: "https://sillycookie.me", role: "Team Penguining", icon: "/images/sillycookie-favicon.png" },
      { name: "Loke Keat Yee", url: "https://keatyee.github.io/", role: "Team Penguining", icon: "/images/keatyee-avatar.jpg" },
      { name: "Tay Ernest", url: "https://portfolio-mu-peach-83.vercel.app/", role: "Team Penguining", icon: "/images/yanlok-avatar.jpg" },
    ],
    screenshots: [
      "/images/projects/foodtrust-extension.webp",
      "/images/projects/foodtrust-architecture.webp",
    ],
  },
  {
    num: "09",
    title: "FYP API",
    desc: "Takes the range anxiety out of EV road trips. Enter a route and it picks the best charging stop, ranked by detour, cost, and ML-predicted charging time, with fallbacks for when the battery runs low. FastAPI service on real Google Maps route data.",
    tags: ["Python", "FastAPI", "scikit-learn", "ML"],
    img: "/images/projects/fyp-api-logo.webp",
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
      { value: "TOP-5", label: "STOPS" },
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
      "ML model predicts the charging minutes for your battery at that charger, with a physics formula as fallback",
      "3-tier search: best charger near the route midpoint, then any reachable one, then the closest as a last resort",
      "Range-anxiety buffer: 5% of the battery held in reserve when deciding what's reachable",
      "Top-5 stops scored by detour, availability, and power",
      "Cost estimate in MYR by connector type and power",
      "Real distance, duration, and polyline from the Google Maps Directions API",
    ],
    screenshots: [
      "/images/projects/fyp-api-newtrip.webp",
      "/images/projects/fyp-api-route.webp",
    ],
  },
  {
    num: "10",
    title: "ARCTIC VAULT",
    desc: "Your whole financial life in one Android app, even offline. Track spending, budgets, savings goals, debts, and bills across 15+ screens, with charts that show where the money goes. Kotlin, Jetpack Compose, and a local Room database.",
    tags: ["Kotlin", "Jetpack Compose", "Room", "Firebase"],
    img: "/images/projects/arcticvault-splash.webp",
    coverAspect: 0.9, // clamped: phone shots are 0.462, which would force a tall hero
    coverFit: "contain",
    coverBg: "#FFFFFF", // phone mockups sit on white
    github: "https://github.com/ExoticPengy/ArcticVault",
    involvements: [
      "Designed all 6 Room entities (transactions, budgets, goals, debts, reminders, categories) with repository-pattern data access",
      "Built the transactions module: recent-first list, calendar and search filters, add and edit, and custom categories",
      "Built the spending analysis charts, Firebase sign-in, and account settings, then integrated the team's modules into one app",
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
      "Transactions module: recent-first list, full history with calendar and search filters, add and edit",
      "Custom categories, with delete validation",
      "Spending analysis with bar charts plus profit and loss cards",
      "Firebase email/password sign-in and account settings",
      "Integrated the team's budgeting, goals, and reminder modules into one app",
      "Offline-first: all 6 tables live in a local Room database",
    ],
    collaborators: [
      { name: "Chin Wen Yee", url: "https://github.com/ChinWenYee", role: "Reminders", icon: "/images/chinwenyee-avatar.png" },
      { name: "Tan Kai Yuan", url: "https://github.com/Kaiyuan101", role: "Budgeting + goals", icon: "/images/kaiyuan101-avatar.png" },
      { name: "Zhen Hui", url: "https://github.com/anreh", role: "Teammate", icon: "/images/anreh-avatar.png" },
    ],
    screenshots: [
      "/images/projects/arcticvault-home.webp",
      "/images/projects/arcticvault-transactions.webp",
      "/images/projects/arcticvault-income.webp",
      "/images/projects/arcticvault-budgeting.webp",
      "/images/projects/arcticvault-goals.webp",
      "/images/projects/arcticvault-debt.webp",
      "/images/projects/arcticvault-bills.webp",
      "/images/projects/arcticvault-analysis.webp",
    ],
  },
  {
    num: "11",
    title: "SUPASWAP",
    desc: "Juggling several Supabase accounts means a logout, browser sign-in, and token copy every time you switch. supaswap makes it one command. Tokens live in the macOS Keychain, never in plain files or shell history. Install with Homebrew.",
    tags: ["Bash", "Homebrew", "macOS", "CLI"],
    img: "/images/projects/supaswap.webp",
    coverAspect: 1.667,
    coverBg: "#0E0C16",
    github: "https://github.com/ExoticPengy/homebrew-supaswap",
    involvements: [
      "Wrote the CLI as one bash script with save, use, ls, rm, and rename commands",
      "Kept tokens out of plain files, ps, and shell history: stored in the Keychain and piped to supabase login on stdin",
      "Published a Homebrew tap with its own formula, plus a test script",
    ],
    stats: [
      { value: "6", label: "COMMANDS" },
      { value: "0", label: "EXTRA DEPS" },
      { value: "BREW", label: "INSTALL" },
    ],
    stack: [
      { name: "Bash", role: "CLI" },
      { name: "macOS Keychain", role: "secrets" },
      { name: "Supabase CLI", role: "target" },
      { name: "Homebrew", role: "distribution" },
    ],
    features: [
      "One command swaps the Supabase CLI to a saved account: supaswap use work",
      "Tokens kept in the macOS Keychain and piped to supabase login on stdin, never on the command line, in ps, or in shell history",
      "ls lists every saved account with the active one starred",
      "Rename and remove, with a guard against overwriting an existing name",
      "Installs from its own Homebrew tap, with a test script",
      "Pure bash, zero extra dependencies",
    ],
  },
  {
    num: "12",
    title: "LOCAL N8N DOCKER",
    desc: "Run your own automation server instead of paying for n8n cloud. One pasted command turns a Mac, even a screenless Mac mini, into a self-hosted n8n box: installs Homebrew and Docker if missing, starts n8n, and keeps your workflows across restarts and updates. Safe to re-run.",
    tags: ["Bash", "Docker", "n8n", "macOS"],
    img: "/images/projects/local-n8n-docker.webp",
    coverAspect: 1.667,
    coverBg: "#0E0C16",
    github: "https://github.com/ExoticPengy/local-n8n-docker",
    involvements: [
      "Wrote an idempotent setup script: every step skips what's already done, so re-running is the fix",
      "Accepted the Docker Desktop license from the command line so a Mac with no screen doesn't stall on a dialog",
      "Kept workflows and credentials in a Docker volume that survives restarts, updates, and re-installs",
    ],
    stats: [
      { value: "1", label: "PASTE" },
      { value: "3", label: "STEPS" },
      { value: "0", label: "CONFIG FILES" },
    ],
    stack: [
      { name: "Bash", role: "installer" },
      { name: "Homebrew", role: "packages" },
      { name: "Docker Desktop", role: "runtime" },
      { name: "n8n", role: "automation" },
    ],
    features: [
      "One paste to a running n8n server: installs Homebrew and Docker Desktop if missing",
      "Idempotent: every step skips what's done, so re-running is the fix",
      "Headless-ready: accepts the Docker Desktop license from the terminal so a screenless Mac mini never stalls on a dialog",
      "Workflows and credentials live in a Docker volume that survives restarts, updates, and re-installs",
      "Local-only by default, opt in to network access",
      "Port, bind address, and timezone set by env vars; n8n restarts whenever Docker does",
    ],
  },
];

function pickTransition() {
  return WIPES[Math.floor(Math.random() * WIPES.length)];
}

const detailCover = () => document.querySelector<HTMLImageElement>(".project-detail-img img");
const scroller = () => document.querySelector<HTMLElement>(".section-view.visible .crt-scroll");

export default function Projects({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<ProjectData | null>(null);
  const [animating, setAnimating] = useState(false);
  const [exiting, setExiting] = useState(false);
  const pixRef = useRef<PixelHandle | null>(null);
  const busy = useRef(false); // sync guard; `animating` state lags a render behind a fast double click
  const gridSpot = useRef<{ top: number; num: string } | null>(null);

  // Layout effect so the encounter reveal measures the detail cover after the scroll reset, not before.
  useLayoutEffect(() => {
    const view = scroller();
    if (!view) return;
    if (selected) { view.scrollTop = 0; return; }
    const spot = gridSpot.current;
    if (!spot) return;
    view.scrollTop = spot.top;
    const card = document.querySelector<HTMLElement>(`[data-enc="${spot.num}"]`);
    card?.focus({ preventScroll: true });
    card?.scrollIntoView({ block: "nearest" }); // prev/next may have moved on to a card that is off-screen
  }, [selected]);

  useEffect(() => { if (selected) unlock("deepdive"); }, [selected]);

  const handleSelect = useCallback((p: ProjectData, cover: HTMLImageElement | null) => {
    if (busy.current) return;
    gridSpot.current = { top: scroller()?.scrollTop ?? 0, num: p.num };
    click(900);
    const pix = pixRef.current;
    if (!pix || !cover || !motionOk()) { setSelected(p); return; }
    busy.current = true;
    setAnimating(true);
    whoosh(0.6);
    pix.encounter(pickTransition(), cover, () => setSelected(p), detailCover, () => click(1200))
      .catch(() => setSelected(p))
      .finally(() => { busy.current = false; setAnimating(false); });
  }, []);

  const handleBack = useCallback(() => {
    if (busy.current) return;
    click(440);
    whoosh(0.4);
    const pix = pixRef.current, img = detailCover();
    if (pix && img && motionOk()) {
      // The reverse snapshots the cover where it sits; scrolled off-screen it would pixelate nothing visible.
      const view = scroller();
      if (view) view.scrollTop = 0;
      // busy only, not `animating`: the grid is not mounted until the reverse ends, so no tab order to drop.
      busy.current = true;
      pix.reverse(img, () => setSelected(null))
        .catch(() => setSelected(null))
        .finally(() => { busy.current = false; });
      return;
    }
    setExiting(true);
    setTimeout(() => {
      setSelected(null);
      setExiting(false);
    }, 300);
  }, []);

  const handleGo = useCallback((p: ProjectData) => {
    if (busy.current) return;
    click(900);
    if (gridSpot.current) gridSpot.current.num = p.num;
    setSelected(p);
  }, []);

  // Document capture sits between the lightbox (window capture, closes zoom first)
  // and Stage (window bubble, would jump to the menu), so Escape steps back one level.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      handleBack();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [selected, handleBack]);

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

  return (
    <SectionShell
      num="02" title="STAGES" ghost="WORK" onBack={onBack}
      line={selected ? `${selected.title.toUpperCase()} · STAGE ${selected.num}. Inspect away.` : `${PROJECTS.length} stages cleared. Pick one to replay.`}
      overlay={<PixelCanvas ref={pixRef} z={9500} />}>
      <div className={`project-detail-wrapper ${selected ? "active" : ""} ${exiting ? "exiting" : ""}`}>
        {selected ? (
          <ProjectDetail
            key={selected.num}
            project={selected}
            prev={PROJECTS[PROJECTS.indexOf(selected) - 1]}
            next={PROJECTS[PROJECTS.indexOf(selected) + 1]}
            onGo={handleGo}
            onBack={handleBack}
            exiting={exiting}
          />
        ) : (
          <div className="projects-grid">
            {PROJECTS.map((p) => (
              <div
                key={p.num}
                className="project-card dlg pick"
                data-enc={p.num}
                data-wild={p.title.toUpperCase()}
                onClick={(e) => handleSelect(p, e.currentTarget.querySelector("img"))}
                role="button"
                tabIndex={animating ? -1 : 0}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  handleSelect(p, e.currentTarget.querySelector("img"));
                }}
              >
                <div className="project-img">
                  <img
                    src={p.img}
                    alt={p.title}
                    loading="lazy"
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
