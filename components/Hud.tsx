"use client";

import { useEffect } from "react";
import { PANELS, TICKER_BITS } from "@/lib/panels";
import type { View } from "@/lib/types";

type Props = {
  focused: boolean;
  focusedId: string | null;
  view: View;
  level: number;
  onTick: () => void;
};

export default function Hud({ focused, focusedId, view, level, onTick }: Props) {
  const activePanel = PANELS.find((p) => p.id === focusedId);
  const sectionPanel = view !== "home" && view !== "flying" ? PANELS.find((p) => p.id === view) : null;
  useEffect(() => {
    const id = setInterval(onTick, 700);
    return () => clearInterval(id);
  }, [onTick]);

  return (
    <div className="hud">
      <div className="corner tl">
        <span className="dot" />
        <span className="bracket">{sectionPanel ? sectionPanel.label : "MAIN MENU"}</span>
        <span>· {sectionPanel ? `STAGE ${sectionPanel.num}` : activePanel ? `STAGE ${activePanel.num} · ${activePanel.label}` : "STAGE SELECT"}</span>
      </div>
      <div className="corner tr">
        <span>PLAYER · PENGY</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span>LV. {String(level).padStart(2, "0")}</span>
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
          <span key={b} style={{ opacity: level % TICKER_BITS.length === i ? 1 : 0.4 }}>
            {b}
          </span>
        ))}
      </div>
      <div className={`crosshair ${focused ? "active" : ""}`} />
    </div>
  );
}
