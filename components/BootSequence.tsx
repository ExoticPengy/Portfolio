"use client";

import { useEffect, useRef, useState } from "react";
import { useTweaks } from "@/hooks/useTweaks";
import { init, coinClink, whoosh, thud } from "@/lib/audio";
import { parseHash } from "@/lib/route";
import { coinPoint, type Fit } from "@/lib/pixels";
import PixelCanvas, { motionOk, type PixelHandle } from "./PixelCanvas";

type Phase = "idle" | "imploding" | "playing" | "done";

const VIDEO_W = 1888;
const VIDEO_H = 1080;

// Mirrors the .boot-video @media rule in globals.css.
function videoFit(): Fit {
  return window.matchMedia("(max-aspect-ratio: 236 / 135)").matches ? "contain" : "cover";
}

export default function BootSequence({ onFinish }: { onFinish?: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [show, setShow] = useState(true);
  const [fx, setFx] = useState(false); // pixel effects on; decided after mount since the server has no window
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const pixRef = useRef<PixelHandle | null>(null);
  const finishedRef = useRef(false);
  const { tweaks } = useTweaks();

  // Skip if already booted this session.
  useEffect(() => {
    let booted = false;
    try { booted = !!sessionStorage.getItem("booted"); } catch { /* private mode */ }
    if (booted) { setShow(false); onFinish?.(); return; }
    setFx(motionOk());
    // The lite probe can flag a slow machine seconds after load. Drop the pixel fx then, unless the shatter already started.
    const mo = new MutationObserver(() => { if (!motionOk() && !finishedRef.current) setFx(false); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-lite"] });
    return () => mo.disconnect();
    // run once on mount only; re-running after onFinish's identity changes would
    // unmount the boot mid-fade (booted is "1" by then) and kill the transition
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) return null;

  const fadeOut = () => {
    pixRef.current?.clear(); // the canvas is portaled, so the root's fade would not hide it
    // Fade out via WAAPI, independent of CSS classes / HMR. Animate the video element
    // directly because it lives in its own GPU layer and ignores ancestor opacity.
    const opts: KeyframeAnimationOptions = { duration: 1200, easing: "ease-out", fill: "forwards" };
    rootRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], opts);
    videoRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], opts);
    setTimeout(() => setShow(false), 1300); // unmount after fade
  };

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try { sessionStorage.setItem("booted", "1"); } catch { /* ignore */ }
    setPhase("done");
    onFinish?.(); // lets the stage start its music
    const v = videoRef.current, pix = pixRef.current;
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".panel-card"), (el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0)
      .map((r) => ({ x: r.x, y: r.y, w: r.width, h: r.height }));
    const home = parseHash(window.location.hash).view === "home";
    // Shatter only when there is a real frame to break and the menu cards to land on.
    if (!fx || !pix || !v || v.readyState < 2 || !cards.length || !home) { fadeOut(); return; }
    const shattering = pix.shatter(v, VIDEO_W, VIDEO_H, videoFit(), cards); // draws the frozen frame right now
    v.pause();
    v.style.visibility = "hidden";
    whoosh(0.8);
    window.setTimeout(() => thud(), 950);
    // The black backdrop lifts while the pixels land, so the real cards appear under them.
    backdropRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 600, easing: "ease-out", fill: "forwards" });
    shattering.then(() => setShow(false), () => fadeOut());
  };

  const start = () => {
    if (phase !== "idle") return;
    init(); // this click unlocks audio
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { finish(); return; }
    const v = videoRef.current;
    if (!v) { finish(); return; }
    v.muted = !tweaks.soundEnabled;
    const pix = pixRef.current;
    if (!fx || !pix) {
      setPhase("playing");
      v.play().catch(() => finish()); // autoplay blocked / no source → skip in
      return;
    }
    setPhase("imploding");
    coinClink();
    // Start playback inside the click so the browser allows it later (with sound), then hold frame 0.
    let hold = true;
    v.play().then(() => { if (hold) v.pause(); }).catch(() => finish());
    const coin = coinPoint(VIDEO_W, VIDEO_H, { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight }, videoFit());
    pix.implode(coin).then(() => {
      if (finishedRef.current) return;
      hold = false;
      v.currentTime = 0;
      setPhase("playing");
      v.play().catch(() => finish());
      return pix.flashOut(220);
    });
  };

  return (
    <div
      ref={rootRef}
      className={`boot boot-${phase}`}
      role="button"
      aria-label="Insert coin to start"
      onClick={phase === "idle" ? start : phase === "playing" ? finish : undefined}
    >
      <div ref={backdropRef} className="boot-backdrop" />
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

      {(phase === "idle" || phase === "imploding") && (
        <div className="boot-idle">
          {/* With pixel fx on, CSS hides this from first paint; it stays in the layout as the canvas title's position and font source. */}
          <div ref={logoRef} className="boot-logo" style={fx ? { visibility: "hidden" } : undefined}>
            CHONG&nbsp;MING&nbsp;LI
          </div>
          <div className="boot-prompt" style={phase === "imploding" ? { visibility: "hidden" } : undefined}>
            ▶ INSERT COIN
          </div>
        </div>
      )}
      {phase === "playing" && <div className="boot-skip">CLICK TO SKIP</div>}
      {fx && (
        <PixelCanvas
          ref={pixRef}
          z={10001}
          onReady={() => { if (logoRef.current) pixRef.current?.title(logoRef.current); }}
        />
      )}
    </div>
  );
}
