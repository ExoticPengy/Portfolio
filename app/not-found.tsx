import Link from "next/link";

export default function NotFound() {
  return (
    <div className="nf">
      <div className="nf-scene">
        <div className="nf-sprite" aria-hidden="true">
          {/* MISSINGNO — glitch block */}
          <div className="nf-glitch" />
        </div>
        <div className="nf-hp">
          <span className="nf-hp-label">Lv404</span>
          <span className="nf-hp-bar"><i /></span>
        </div>
      </div>
      <div className="nf-box">
        <p className="nf-line">A wild <b>MISSINGNO.</b> appeared!</p>
        <p className="nf-line nf-dim">This page fled. Error 404 — route not found.</p>
        <Link href="/" className="nf-run">▶ RUN</Link>
      </div>
    </div>
  );
}
