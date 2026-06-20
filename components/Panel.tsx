"use client";

import type { IconType } from "react-icons";
import { FaUser, FaGamepad, FaBolt, FaEnvelope } from "react-icons/fa";
import type { PanelData } from "@/lib/types";

const STAGE_ICON: Record<PanelData["id"], IconType> = {
  about: FaUser,
  projects: FaGamepad,
  skills: FaBolt,
  contact: FaEnvelope,
};

type Props = {
  panel: PanelData;
  focused: boolean;
  onActivate: (panel: PanelData) => void;
  onHover: () => void;
  onLeave?: () => void;
};

export default function Panel({ panel, focused, onActivate, onHover, onLeave }: Props) {
  const Icon = STAGE_ICON[panel.id];
  return (
    <div
      className="panel"
      style={{
        transform: `translate3d(${panel.x}px, ${panel.y}px, ${panel.z}px) rotateY(${panel.ry}deg) rotateX(${panel.rx}deg)`,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={() => onActivate(panel)}
    >
      <div
        className="panel-card"
        style={{
          animationDelay: panel.delay + "s",
          outline: focused ? "2px solid var(--accent-2)" : "none",
          outlineOffset: focused ? "6px" : "0",
        }}
      >
        <div className="panel-stage">{panel.num}</div>
        <span className="panel-corner tl" />
        <span className="panel-corner tr" />
        <span className="panel-corner bl" />
        <span className="panel-corner br" />
        <div className="panel-num">STAGE {panel.num}</div>
        <div className="panel-glyph">{panel.glyph}</div>
        <div className="panel-img" data-stage={panel.id}>
          <Icon className="panel-img-icon" />
        </div>
        <div className="panel-label">
          <div className="big">{panel.label}</div>
          <div className="sub">
            <span>{panel.sub}</span>
            <span className="arrow">▶</span>
          </div>
        </div>
      </div>
    </div>
  );
}
