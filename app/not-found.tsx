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
        <Link href="/" className="nf-run">
          <svg className="nf-run-icon" viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
            <rect x="8" y="1" width="3" height="3" />{/* head */}
            <rect x="6" y="5" width="4" height="4" />{/* torso, leaning */}
            <rect x="3" y="5" width="3" height="2" />{/* back arm */}
            <rect x="10" y="6" width="3" height="2" />{/* front arm */}
            <rect x="5" y="9" width="2" height="3" />{/* back thigh */}
            <rect x="3" y="11" width="2" height="2" />{/* back foot */}
            <rect x="9" y="9" width="2" height="2" />{/* front thigh */}
            <rect x="10" y="11" width="3" height="2" />{/* front foot */}
          </svg>
          RUN
        </Link>
      </div>
    </div>
  );
}
