import SectionShell from "./SectionShell";

export default function About({ onBack }: { onBack: () => void }) {
  return (
    <SectionShell num="01" title="CHARACTER" ghost="WHO" onBack={onBack}>
      <div className="reveal d1">
        <div className="about-bio">
          <p>
            <span className="dim">{"// player profile"}</span>
            <span className="accent">Chong Ming Li</span> — Software Developer · Data Scientist
            <br />
            Building things that ship and making sure they keep running.
          </p>
          <p>
            <span className="dim">{"// current quest"}</span>
            Full-stack generalist. Currently grinding through web systems,
            data pipelines, and whatever interesting problem lands on my desk next.
          </p>
          <p>
            <span className="dim">{"// loadout"}</span>
            Ship early. Delete ruthlessly. Add only what you need.
          </p>
        </div>
        <div className="about-stats" style={{ marginTop: 36 }}>
          <div className="stat-card">
            <div className="label">Products Shipped</div>
            <div className="value">5+</div>
            <div className="unit">in production</div>
          </div>
          <div className="stat-card">
            <div className="label">XP · Years Coding</div>
            <div className="value">05</div>
            <div className="unit">and counting</div>
          </div>
          <div className="stat-card">
            <div className="label">Energy Drinks / Day</div>
            <div className="value">03</div>
            <div className="unit">averaged · cal.</div>
          </div>
          <div className="stat-card">
            <div className="label">Open Source</div>
            <div className="value">∞</div>
            <div className="unit">always shipping</div>
          </div>
        </div>
      </div>
      <div className="reveal d2">
        <div className="headshot">
          <span className="placeholder-label">[ HEADSHOT · 4:5 ]</span>
        </div>
      </div>
    </SectionShell>
  );
}
