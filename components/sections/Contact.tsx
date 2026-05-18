import SectionShell from "./SectionShell";

export default function Contact({ onBack }: { onBack: () => void }) {
  return (
    <SectionShell num="04" title="CONNECT" ghost="HI!" onBack={onBack}>
      <div className="contact-body">
        <div className="contact-lines reveal d1">
          <a className="contact-row" href="https://github.com/ExoticPengy">
            <span className="k">▶ GITHUB</span>
            <span className="v">@ExoticPengy</span>
          </a>
          <a className="contact-row" href="https://www.linkedin.com/in/exoticpengy/">
            <span className="k">▶ LINKEDIN</span>
            <span className="v">/in/exoticpengy</span>
          </a>
          <a className="contact-row" href="https://www.instagram.com/SillyPengy/">
            <span className="k">▶ INSTAGRAM</span>
            <span className="v">@SillyPengy</span>
          </a>
          <div className="contact-row">
            <span className="k">◆ LOCATION</span>
            <span className="v">
              <span className="loc-full">Kuala Lumpur, </span>
              <span className="loc-short">KL, </span>Malaysia
            </span>
          </div>
          <div className="contact-row">
            <span className="k">◆ REMOTE</span>
            <span className="v">UTC+8</span>
          </div>
        </div>
        <div className="contact-cta reveal d2">
          <div className="big">PRESS START.<br />LET&rsquo;S BUILD<br />SOMETHING.</div>
          <div className="small">
            Open to project-based engagements, n8n workflow automation,
            and short-term consulting.
          </div>
          <button onClick={() => { window.open("https://www.linkedin.com/in/exoticpengy/", "_blank"); }}>
            ▶ MESSAGE ON LINKEDIN
          </button>
        </div>
      </div>
    </SectionShell>
  );
}
