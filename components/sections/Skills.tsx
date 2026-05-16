import SectionShell from "./SectionShell";

const SKILLS = [
  {
    name: "ML / RESEARCH",
    items: [
      ["PyTorch", 95], ["Transformers", 90], ["Diffusion Models", 75],
      ["Reinforcement Learning", 65], ["Bayesian Methods", 70],
    ] as [string, number][],
  },
  {
    name: "ENGINEERING",
    items: [
      ["Python", 98], ["TypeScript", 85], ["Go", 70],
      ["Rust", 55], ["SQL", 88],
    ] as [string, number][],
  },
  {
    name: "INFRASTRUCTURE",
    items: [
      ["Kubernetes", 80], ["Ray / Spark", 85], ["AWS / GCP", 82],
      ["MLflow / W&B", 88], ["Terraform", 65],
    ] as [string, number][],
  },
];

export default function Skills({ onBack }: { onBack: () => void }) {
  return (
    <SectionShell num="03" title="ABILITIES" ghost="POW" onBack={onBack}>
      <div className="skills-grid">
        {SKILLS.map((cat, i) => (
          <div key={cat.name} className={`skill-cat reveal d${i + 1}`}>
            <h3>{cat.name}</h3>
            <ul>
              {cat.items.map(([n, lvl]) => (
                <li key={n}>
                  <span>{n}</span>
                  <span className="bar" style={{ "--lvl": lvl + "%" } as React.CSSProperties} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
