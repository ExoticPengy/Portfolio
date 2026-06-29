"use client";

import { useEffect, useRef, useState } from "react";
import { useTweaks } from "@/hooks/useTweaks";
import { init } from "@/lib/audio";

type Phase = "idle" | "playing" | "done";

export default function BootSequence({ onFinish }: { onFinish?: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [show, setShow] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const finishedRef = useRef(false);
  const { tweaks } = useTweaks();

  // Skip if already booted this session.
  useEffect(() => {
    let booted = false;
    try { booted = !!sessionStorage.getItem("booted"); } catch { /* private mode */ }
    if (booted) { setShow(false); onFinish?.(); }
    // run once on mount only — re-running after onFinish's identity changes would
    // unmount the boot mid-fade (booted is "1" by then) and kill the transition
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) return null;

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try { sessionStorage.setItem("booted", "1"); } catch { /* ignore */ }
    setPhase("done");
    onFinish?.();                           // lets the stage start its music
    // Fade out via WAAPI — independent of CSS classes / HMR. Animate the video element
    // directly because it lives in its own GPU layer and ignores ancestor opacity.
    const opts: KeyframeAnimationOptions = { duration: 1200, easing: "ease-out", fill: "forwards" };
    rootRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], opts);
    videoRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], opts);
    setTimeout(() => setShow(false), 1300); // unmount after fade
  };

  const start = () => {
    if (phase !== "idle") return;
    init(); // this click unlocks audio
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { finish(); return; }
    const v = videoRef.current;
    if (!v) { finish(); return; }
    setPhase("playing");
    v.muted = !tweaks.soundEnabled;
    v.play().catch(() => finish()); // autoplay blocked / no source → skip in
  };

  return (
    <div
      ref={rootRef}
      className={`boot boot-${phase}`}
      role="button"
      aria-label="Insert coin to start"
      onClick={phase === "idle" ? start : phase === "playing" ? finish : undefined}
    >
      <video
        ref={videoRef}
        className="boot-video"
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      {phase === "idle" && (
        <div className="boot-idle">
          <div className="boot-logo">CHONG&nbsp;MING&nbsp;LI</div>
          <div className="boot-prompt">▶ INSERT COIN</div>
        </div>
      )}
      {phase === "playing" && <div className="boot-skip">CLICK TO SKIP</div>}
    </div>
  );
}
