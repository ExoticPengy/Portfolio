"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motionOk } from "./PixelCanvas";
import { nextIndex, COVER_MS } from "@/lib/cardArt";

export type ArtSource = { src: string; fit?: "cover" | "contain"; bg?: string };

type Props = {
  sources?: ArtSource[]; // photos; more than one cycles (Projects)
  icons?: ReactNode[]; // react-icons, laid out on a grid instead of a photo
  hold: boolean; // hover or keyboard focus: stop cycling on the current cover
  live: boolean; // menu is showing, cycling allowed
};

export default function CardArt({ sources = [], icons, hold, live }: Props) {
  // [current, previous]: the previous cover stays underneath while the new one fades in.
  const [[idx, prev], setIdx] = useState<[number, number]>([0, -1]);
  const n = sources.length;

  useEffect(() => {
    if (!live || hold || n < 2 || !motionOk()) return;
    const t = window.setInterval(() => setIdx(([i]) => [nextIndex(i, n), i]), COVER_MS);
    return () => window.clearInterval(t);
  }, [live, hold, n]);

  if (icons) return <div className="card-art card-art-icons">{icons}</div>;
  return (
    <div className="card-art">
      {/* ponytail: only current + previous are mounted, so the menu never loads all ten covers up front */}
      {sources.map((s, i) => (i === idx || i === prev) && (
        <img
          key={s.src}
          src={s.src}
          alt=""
          className={i === idx ? "on" : undefined}
          style={{ objectFit: s.fit ?? "cover", background: s.bg }}
        />
      ))}
    </div>
  );
}
