"use client";

import { useRef, useState } from "react";
import { useTweaks } from "@/hooks/useTweaks";
import type { View } from "@/lib/types";
import Hero from "./Hero";
import Decor from "./Decor";
import Panel from "./Panel";
import { PANELS } from "@/lib/panels";

export default function Stage() {
  const { tweaks } = useTweaks();
  const [view, setView] = useState<View>("home");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [keyboardIdx, setKeyboardIdx] = useState<number>(0);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current.tx = e.clientX / rect.width - 0.5;
    mouseRef.current.ty = e.clientY / rect.height - 0.5;
  };

  return (
    <div className="app" onMouseMove={onMouseMove}>
      <div className="bg-grid" />
      <div className="bg-vignette" />

      <div className={`scene ${view !== "home" && view !== "flying" ? "hidden" : ""}`}>
        <div className="scene-scaler">
          <div ref={worldRef} className="world">
            <Decor />
            <Hero fading={view !== "home"} />
            {PANELS.map((p, i) => (
              <Panel
                key={p.id}
                panel={p}
                focused={view === "home" && (focusedId === p.id || keyboardIdx === i)}
                onActivate={() => { /* wired in Task 17 */ }}
                onHover={() => setFocusedId(p.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
