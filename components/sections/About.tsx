import SectionShell from "./SectionShell";
import CommitLog from "./CommitLog";
import { PROJECTS } from "./Projects";

const LIVE = PROJECTS.filter((p) => p.live).length;

export default function About({ onBack }: { onBack: () => void }) {
  return (
    <SectionShell num="01" title="CHARACTER" ghost="WHO" line="CHONG MING LI joined the party!" onBack={onBack}>
      <div className="reveal d1">
        <div className="about-bio dlg more">
          <p>
            <span className="dim">{"// player profile"}</span>
            <span className="accent">Chong Ming Li</span> — Software Developer · Data Scientist
            <br />
            Based in Malaysia, remote OK. I build full-stack products and the data work behind
            them, and I care that they stay up after launch.
          </p>
          <p>
            <span className="dim">{"// current quest"}</span>
            Building developer tools and AI data products. Lately: supaswap, a Homebrew CLI
            that switches Supabase accounts in one command; a one-paste installer for
            self-hosted n8n on Docker; and BigQuery connectors and scheduled briefings for BINGO.
          </p>
          <p>
            <span className="dim">{"// loadout"}</span>
            Next.js and TypeScript up front, Python and FastAPI behind, SQL and ML for the data.
            Ship it, then make it better.
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
          <div className="stat-card dlg" data-enc="live">
            <div className="label">Live Sites</div>
            <div className="value count pad" style={{ "--to": LIVE } as React.CSSProperties}><span className="sr-only">{String(LIVE).padStart(2, "0")}</span></div>
            <div className="unit">try them in Projects</div>
          </div>
          <div className="stat-card dlg" data-enc="repos">
            <div className="label">Public Repos</div>
            <div className="value count" style={{ "--to": 25 } as React.CSSProperties}><span className="sr-only">25</span></div>
            <div className="unit">on GitHub</div>
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
