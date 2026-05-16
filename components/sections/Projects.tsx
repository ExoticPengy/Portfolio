import SectionShell from "./SectionShell";

const PROJECTS = [
  {
    num: "01",
    title: "NEURAL FORECAST ENGINE",
    desc: "A time-series forecasting pipeline for retail demand. Transformer + classical ensemble running on streaming data — sub-100ms p99 latency across 40k SKUs. Boss fight: making it explainable to non-ML folks.",
    tags: ["PyTorch", "Ray", "Kafka", "PRODUCTION"],
    img: "cover art · 16:10",
  },
  {
    num: "02",
    title: "SEMANTIC SEARCH STACK",
    desc: "End-to-end retrieval system: custom embeddings, ANN index, re-ranker. Open source, BYO corpus. 5× recall over BM25 on internal benchmark. Side-quest: shipping it as a tiny single-binary install.",
    tags: ["Transformers", "FAISS", "FastAPI", "OSS"],
    img: "cover art · 16:10",
  },
];

export default function Projects({ onBack }: { onBack: () => void }) {
  return (
    <SectionShell num="02" title="STAGES" ghost="WORK" onBack={onBack}>
      <div className="projects-grid">
        {PROJECTS.map((p, i) => (
          <div key={p.num} className={`project-card reveal d${i + 1}`}>
            <div className="project-img">
              <span className="pl-tag">[ {p.img.toUpperCase()} ]</span>
            </div>
            <div className="project-body">
              <div className="project-num">STAGE {p.num} · CLEARED</div>
              <h3 className="project-title">{p.title}</h3>
              <p className="project-desc">{p.desc}</p>
              <div className="project-tags">
                {p.tags.map((tg) => <span key={tg} className="tag">{tg}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
