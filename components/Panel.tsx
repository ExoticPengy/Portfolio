"use client";

import { useRef, type ReactNode } from "react";
import { FaEnvelope, FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import type { PanelData } from "@/lib/types";
import CardArt, { type ArtSource } from "./CardArt";
import { motionOk } from "./PixelCanvas";
import { PROJECTS } from "./sections/Projects";
import { SKILLS, ICONS, COLORS } from "./sections/Skills";
import { topSkills } from "@/lib/cardArt";

type Props = {
  panel: PanelData;
  focused: boolean;
  live: boolean;
  onActivate: (panel: PanelData) => void;
  onHover: () => void;
  onLeave?: () => void;
};

const ART: Record<PanelData["id"], { sources?: ArtSource[]; icons?: ReactNode[] }> = {
  about: { sources: [{ src: "/headshot.webp" }] },
  projects: { sources: PROJECTS.map((p) => ({ src: p.img, fit: p.coverFit ?? "cover", bg: p.coverBg })) },
  skills: {
    icons: topSkills(SKILLS).flatMap((n) => {
      const Icon = ICONS[n];
      return Icon ? [<Icon key={n} color={COLORS[n]} aria-hidden />] : [];
    }),
  },
  contact: {
    icons: [
      <FaEnvelope key="mail" color="#EA4335" aria-hidden />,
      <FaGithub key="gh" color="#181717" aria-hidden />,
      <FaLinkedin key="li" color="#0A66C2" aria-hidden />,
      <FaInstagram key="ig" color="#E4405F" aria-hidden />,
    ],
  },
};

export default function Panel({ panel, focused, live, onActivate, onHover, onLeave }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Holo tilt + foil follow the pointer. Motion off: the CSS default (0.5, 0.5) keeps the card flat and the shine still.
  const onMove = (e: React.PointerEvent) => {
    const c = cardRef.current;
    if (!c || !motionOk()) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--hx", ((e.clientX - r.left) / r.width).toFixed(3));
    c.style.setProperty("--hy", ((e.clientY - r.top) / r.height).toFixed(3));
  };

  return (
    <div
      className="panel"
      style={{
        transform: `translate3d(${panel.x}px, ${panel.y}px, ${panel.z}px) rotateY(${panel.ry}deg) rotateX(${panel.rx}deg)`,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onPointerMove={onMove}
      onClick={() => onActivate(panel)}
    >
      <div
        ref={cardRef}
        className="panel-card"
        data-stage={panel.id}
        style={{
          animationDelay: panel.delay + "s",
          outline: focused ? "2px solid var(--accent-2)" : "none",
          outlineOffset: focused ? "6px" : "0",
        }}
      >
        <div className="tcg-top">
          <span className="tcg-name">{panel.label}</span>
          <span className="tcg-hp">HP {panel.hp}<span className="tcg-type"><panel.glyph aria-hidden /></span></span>
        </div>
        <CardArt {...ART[panel.id]} hold={focused} live={live} />
        <div className="tcg-strip">{panel.strip}</div>
        <div className="tcg-atk">
          <div><b>{panel.attack.name}</b><i>{panel.attack.desc}</i></div>
          <span className="tcg-dmg">{panel.attack.value}</span>
        </div>
        <p className="tcg-flav">&ldquo;{panel.flavour}&rdquo;</p>
        <div className="tcg-foot"><span>STAGE {panel.num}/04</span><span className="arrow">▶</span></div>
      </div>
    </div>
  );
}
