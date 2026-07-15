"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useResponsiveScale } from "@/hooks/useResponsiveScale";
import { useTweaks } from "@/hooks/useTweaks";
import { useParallax } from "@/hooks/useParallax";
import { useFlyTransition } from "@/hooks/useFlyTransition";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useKonami } from "@/hooks/useKonami";
import { useAudio } from "@/hooks/useAudio";
import { whoosh, click, hover as hoverSfx, thud, jingle, startMusic, stopMusic, setSfxVolume, setMusicVolume } from "@/lib/audio";
import BootSequence from "./BootSequence";
import { parseHash, formatHash } from "@/lib/route";
import type { View } from "@/lib/types";
import Hero from "./Hero";
import Decor from "./Decor";
import Panel from "./Panel";
import Hud from "./Hud";
import TweaksPanel from "./TweaksPanel";
import PokemonRunners from "./PokemonRunners";
import MoveFx, { type MoveFxHandle } from "./MoveFx";
import { BackgroundBurst, BackgroundFx } from "./Background";
import FxOverlays from "./FxOverlays";
import About from "./sections/About";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import Contact from "./sections/Contact";
import { PANELS } from "@/lib/panels";

export default function Stage() {
  useResponsiveScale();
  const { tweaks, setTweak } = useTweaks();
  useAudio(tweaks.soundEnabled);
  const [view, setView] = useState<View>("home");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [keyboardIdx, setKeyboardIdx] = useState<number>(0);
  const [kbActive, setKbActive] = useState<boolean>(false);
  const [level, setLevel] = useState(1);
  const [shinyToast, setShinyToast] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  const onKonami = useCallback(() => {
    const next = !tweaks.shiny;
    setTweak("shiny", next);
    if (next) { jingle(); setShinyToast(true); setTimeout(() => setShinyToast(false), 2600); }
  }, [tweaks.shiny, setTweak]);
  useKonami(onKonami);

  useEffect(() => { setSfxVolume(tweaks.sfxVolume / 10); }, [tweaks.sfxVolume]);
  useEffect(() => { setMusicVolume(tweaks.musicVolume / 10); }, [tweaks.musicVolume]);

  useEffect(() => {
    if (!introDone) return; // don't clash with the intro video's audio
    if (tweaks.musicEnabled) startMusic();
    else stopMusic();
    return () => stopMusic();
  }, [introDone, tweaks.musicEnabled]);

  const handleLevelTick = useCallback(() => { if (introDone) setLevel((l) => l + 1); }, [introDone]);
  const handleLevelUp = useCallback(() => { if (introDone) setLevel((l) => l + 1); }, [introDone]);
  const handleResetLevel = useCallback(() => setLevel(1), []);

  const worldRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const flashRef = useRef<HTMLDivElement | null>(null);
  const streakRef = useRef<HTMLDivElement | null>(null);
  const moveFxRef = useRef<MoveFxHandle | null>(null);

  useParallax(worldRef, mouseRef, view, tweaks.motionIntensity);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current.tx = e.clientX / rect.width - 0.5;
    mouseRef.current.ty = e.clientY / rect.height - 0.5;
    const g = glowRef.current;
    if (g) {
      g.style.setProperty("--mx", e.clientX + "px");
      g.style.setProperty("--my", e.clientY + "px");
    }
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
    onMove: () => { setKbActive(true); hoverSfx(); },
  });

  const effectiveFocusedId = kbActive ? PANELS[keyboardIdx]?.id ?? null : focusedId;

  // --- Hash route: keep the view in the URL so a refresh lands back here. ---
  // Restored via effect (not lazy initial state) to keep SSR markup and the first
  // client render identical. Deep links skip the fly transition.
  // Latest values for the listener below, which is registered once on mount.
  const viewRef = useRef(view);
  const backRef = useRef(back);
  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { backRef.current = back; }, [back]);

  const [routeReady, setRouteReady] = useState(false);
  useEffect(() => {
    const apply = () => {
      const { view: v } = parseHash(window.location.hash);
      const current = viewRef.current;
      if (current !== v) {
        if (v === "home" && current !== "home" && current !== "flying") {
          // Browser Back must run the real return, or the world keeps the flown-in
          // transform and its transition, and never animates out.
          backRef.current();
        } else {
          setView(v); // deep link / forward: land directly, no fly transition
          setFocusedId(v === "home" ? null : v);
        }
      }
      setRouteReady(true); // batched above, so the writer never sees a stale view
    };
    apply(); // restore on mount
    window.addEventListener("hashchange", apply); // browser back/forward
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  useEffect(() => {
    // Gate on state, not a ref: StrictMode double-invokes effects on mount and
    // would burn a ref guard, letting the transient "home" clobber a deep link.
    if (!routeReady) return;
    if (view === "flying") return; // transient
    const current = parseHash(window.location.hash);
    if (current.view === view) return; // Projects owns the slug segment of #/projects/*
    const next = formatHash(view);
    if (window.location.hash !== next) window.location.hash = next;
  }, [view, routeReady]);

  return (
    <div className="app" onMouseMove={onMouseMove}>
      <div ref={glowRef} className="cursor-glow" />
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
                focused={view === "home" && (focusedId === p.id || (kbActive && keyboardIdx === i))}
                onActivate={fly}
                onHover={() => { hoverSfx(); setFocusedId(p.id); setKbActive(false); }}
                onLeave={() => setFocusedId((cur) => (cur === p.id ? null : cur))}
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

      <Hud
        focused={effectiveFocusedId !== null && view === "home"}
        focusedId={effectiveFocusedId}
        view={view}
        level={level}
        onTick={handleLevelTick}
      />
      <TweaksPanel onResetLevel={handleResetLevel} />
      <PokemonRunners
        level={level}
        onPokemonClick={(name, x, y) => {
          handleLevelUp();
          moveFxRef.current?.trigger(x, y, name);
        }}
      />
      <MoveFx ref={moveFxRef} />

      {shinyToast && <div className="shiny-toast">✦ SHINY MODE UNLOCKED</div>}
      <BootSequence onFinish={() => setIntroDone(true)} />
    </div>
  );
}
