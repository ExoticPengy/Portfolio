import SectionShell from "./SectionShell";
import CommitLog from "./CommitLog";

export default function About({ onBack }: { onBack: () => void }) {
  return (
    <SectionShell num="01" title="CHARACTER" ghost="WHO" line="CHONG MING LI joined the party!" onBack={onBack}>
      <div className="reveal d1">
        <div className="about-bio dlg more">
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
          <div className="stat-card dlg" data-enc="shipped" data-line="It's super effective! Stats maxed.">
            <div className="label">Products Shipped</div>
            <div className="value count" data-suffix="+" style={{ "--to": 5 } as React.CSSProperties}><span className="sr-only">5+</span></div>
            <div className="unit">in production</div>
          </div>
          <div className="stat-card dlg" data-enc="years">
            <div className="label">XP · Years Coding</div>
            <div className="value count pad" style={{ "--to": 5 } as React.CSSProperties}><span className="sr-only">05</span></div>
            <div className="unit">and counting</div>
          </div>
          <div className="stat-card dlg" data-enc="drinks">
            <div className="label">Energy Drinks / Day</div>
            <div className="value count pad" style={{ "--to": 3 } as React.CSSProperties}><span className="sr-only">03</span></div>
            <div className="unit">averaged · cal.</div>
          </div>
          <div className="stat-card dlg" data-enc="oss">
            <div className="label">Open Source</div>
            <div className="value">∞</div>
            <div className="unit">always shipping</div>
          </div>
        </div>
      </div>
      <div className="reveal d2">
        <div className="headshot crt-frame">
          <img src="/headshot.webp" alt="Chong Ming Li" className="headshot-img" />
        </div>
      </div>
      <CommitLog user="ExoticPengy" />
    </SectionShell>
  );
}
