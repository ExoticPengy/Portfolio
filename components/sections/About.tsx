import SectionShell from "./SectionShell";

export default function About({ onBack }: { onBack: () => void }) {
  return (
    <SectionShell num="01" title="CHARACTER" ghost="WHO" onBack={onBack}>
      <div className="reveal d1">
        <div className="about-bio">
          <p>
            <span className="dim">{"// player profile"}</span>
            Hi, I&rsquo;m <span className="accent">Chong Ming Li</span> — a Software Developer
            and Data Scientist who likes turning research into things people actually use.
            I build production systems that move at the speed of research, and research that
            survives contact with production.
          </p>
          <p>
            <span className="dim">{"// current quest"}</span>
            Making models that are small, fast, and explainable — in that order.
            Lately I&rsquo;ve been deep in retrieval systems, time-series forecasting,
            and the very unglamorous plumbing that makes ML actually ship.
          </p>
          <p>
            <span className="dim">{"// loadout"}</span>
            The best code is the code you didn&rsquo;t need to write. The best model is the
            one you didn&rsquo;t need to deploy. Ruthlessly delete; carefully add.
          </p>
        </div>
        <div className="about-stats" style={{ marginTop: 36 }}>
          <div className="stat-card">
            <div className="label">Models Shipped</div>
            <div className="value">12+</div>
            <div className="unit">in production</div>
          </div>
          <div className="stat-card">
            <div className="label">XP · Years Coding</div>
            <div className="value">07</div>
            <div className="unit">and counting</div>
          </div>
          <div className="stat-card">
            <div className="label">Coffee / Day</div>
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
