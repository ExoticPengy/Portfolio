import SectionShell from "./SectionShell";

export default function Contact({ onBack }: { onBack: () => void }) {
  return (
    <SectionShell num="04" title="CONNECT" ghost="HI!" onBack={onBack}>
      <div className="contact-body">
        <div className="contact-lines reveal d1">
          <a className="contact-row" href="mailto:hello@chongming.li">
            <span className="k">▶ EMAIL</span>
            <span className="v">hello@chongming.li</span>
          </a>
          <a className="contact-row" href="#">
            <span className="k">▶ GITHUB</span>
            <span className="v">@chongmingli</span>
          </a>
          <a className="contact-row" href="#">
            <span className="k">▶ LINKEDIN</span>
            <span className="v">/in/chongmingli</span>
          </a>
          <a className="contact-row" href="#">
            <span className="k">▶ TWITTER / X</span>
            <span className="v">@cm_li</span>
          </a>
          <div className="contact-row">
            <span className="k">◆ LOCATION</span>
            <span className="v">REMOTE · UTC+8</span>
          </div>
        </div>
        <div className="contact-cta reveal d2">
          <div className="big">PRESS START.<br />LET&rsquo;S BUILD<br />SOMETHING.</div>
          <div className="small">
            Open to senior IC roles, research collaborations, and short-engagement
            consulting on ML infra &amp; applied research. Replies in &lt; 24h.
          </div>
          <button onClick={() => { window.location.href = "mailto:hello@chongming.li"; }}>
            ▶ SEND TRANSMISSION
          </button>
        </div>
      </div>
    </SectionShell>
  );
}
