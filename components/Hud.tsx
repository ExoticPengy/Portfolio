"use client";

import { useEffect, useState } from "react";
import { TICKER_BITS } from "@/lib/panels";

type Props = { focused: boolean };

export default function Hud({ focused }: Props) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hud">
      <div className="corner tl">
        <span className="dot" />
        <span className="bracket">MAIN MENU</span>
        <span>· STAGE SELECT</span>
      </div>
      <div className="corner tr">
        <span>PLAYER · PENGY</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span>LV. {String(tick + 27).padStart(2, "0")}</span>
      </div>
      <div className="corner bl">
        <span className="kbd">←</span>
        <span className="kbd">→</span>
        <span className="kbd">↑</span>
        <span className="kbd">↓</span>
        <span style={{ opacity: 0.55 }}>MOVE</span>
        <span style={{ opacity: 0.35 }}>·</span>
        <span className="kbd">↵</span>
        <span style={{ opacity: 0.55 }}>CONFIRM</span>
        <span style={{ opacity: 0.35 }}>·</span>
        <span className="kbd">ESC</span>
        <span style={{ opacity: 0.55 }}>BACK</span>
      </div>
      <div className="corner br ticker">
        {TICKER_BITS.map((b, i) => (
          <span key={b} style={{ opacity: tick % TICKER_BITS.length === i ? 1 : 0.4 }}>
            {b}
          </span>
        ))}
      </div>
      <div className={`crosshair ${focused ? "active" : ""}`} />
    </div>
  );
}
