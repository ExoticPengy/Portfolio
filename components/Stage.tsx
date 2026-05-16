"use client";

import { useRef, useState } from "react";
import { useResponsiveScale } from "@/hooks/useResponsiveScale";
import { useTweaks } from "@/hooks/useTweaks";
import { useParallax } from "@/hooks/useParallax";
import { useFlyTransition } from "@/hooks/useFlyTransition";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useAudio } from "@/hooks/useAudio";
import { whoosh, click, hover as hoverSfx, thud } from "@/lib/audio";
import type { View } from "@/lib/types";
import Hero from "./Hero";
import Decor from "./Decor";
import Panel from "./Panel";
import Hud from "./Hud";
import { BackgroundBurst, BackgroundFx } from "./Background";
import FxOverlays from "./FxOverlays";
import About from "./sections/About";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import Contact from "./sections/Contact";
import { PANELS } from "@/lib/panels";

export default function Stage() {
  useResponsiveScale();
  const { tweaks } = useTweaks();
  useAudio(tweaks.soundEnabled);
  const [view, setView] = useState<View>("home");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [keyboardIdx, setKeyboardIdx] = useState<number>(0);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const flashRef = useRef<HTMLDivElement | null>(null);
  const streakRef = useRef<HTMLDivElement | null>(null);

  useParallax(worldRef, mouseRef, view, tweaks.motionIntensity);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current.tx = e.clientX / rect.width - 0.5;
    mouseRef.current.ty = e.clientY / rect.height - 0.5;
  };

  const { fly, back } = useFlyTransition({
    view, setView, setFocusedId,
    worldRef, flashRef, streakRef,
    motionIntensity: tweaks.motionIntensity,
    onFlyStart: (i) => { whoosh(0.5 + i / 14); click(900); },
    onFlyEnd: () => thud(),
    onBackStart: () => { click(440); whoosh(0.4); },
  });

  useKeyboardNav({
    view, keyboardIdx, setKeyboardIdx, fly, back,
    onMove: () => hoverSfx(),
  });

  return (
    <div className="app" onMouseMove={onMouseMove}>
      <div className="bg-grid" />
      <div className="bg-vignette" />
      <BackgroundBurst />

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
                onActivate={fly}
                onHover={() => { hoverSfx(); setFocusedId(p.id); }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={`section-view ${view === "about" ? "visible" : ""}`}>
        {view === "about" && <About onBack={back} />}
      </div>
      <div className={`section-view ${view === "projects" ? "visible" : ""}`}>
        {view === "projects" && <Projects onBack={back} />}
      </div>
      <div className={`section-view ${view === "skills" ? "visible" : ""}`}>
        {view === "skills" && <Skills onBack={back} />}
      </div>
      <div className={`section-view ${view === "contact" ? "visible" : ""}`}>
        {view === "contact" && <Contact onBack={back} />}
      </div>

      <FxOverlays flashRef={flashRef} streakRef={streakRef} />
      <BackgroundFx />

      <Hud focused={focusedId !== null && view === "home"} />
    </div>
  );
}
