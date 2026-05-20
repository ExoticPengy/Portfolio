import { useState, useCallback } from "react";
import SectionShell from "./SectionShell";
import ProjectDetail from "./ProjectDetail";
import { whoosh, click } from "@/lib/audio";
import type { ProjectData } from "@/lib/types";

const PROJECTS: ProjectData[] = [
  {
    num: "01",
    title: "NEURAL FORECAST ENGINE",
    desc: "A time-series forecasting pipeline for retail demand. Transformer + classical ensemble running on streaming data — sub-100ms p99 latency across 40k SKUs. Boss fight: making it explainable to non-ML folks.",
    tags: ["PyTorch", "Ray", "Kafka", "PRODUCTION"],
    img: "cover art · 16:10",
    github: "https://github.com",
    live: "https://example.com",
    involvements: [
      "Designed the ensemble architecture combining Transformer with classical statistical models",
      "Built streaming data pipeline on Kafka handling 40k SKU updates per minute",
      "Implemented SHAP-based explainability layer for non-technical stakeholders",
      "Optimized inference to sub-100ms p99 through model quantization and Ray Serve tuning",
    ],
  },
  {
    num: "02",
    title: "SEMANTIC SEARCH STACK",
    desc: "End-to-end retrieval system: custom embeddings, ANN index, re-ranker. Open source, BYO corpus. 5× recall over BM25 on internal benchmark. Side-quest: shipping it as a tiny single-binary install.",
    tags: ["Transformers", "FAISS", "FastAPI", "OSS"],
    img: "cover art · 16:10",
    github: "https://github.com",
    live: "https://example.com",
    involvements: [
      "Trained custom embedding models fine-tuned on domain-specific corpora",
      "Built approximate nearest neighbor index with FAISS for sub-10ms retrieval",
      "Designed two-stage re-ranking pipeline improving precision by 35%",
      "Packaged entire stack as a single-binary distribution with embedded Python runtime",
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
                  <span className="pl-tag">[ {p.img.toUpperCase()} ]</span>
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
