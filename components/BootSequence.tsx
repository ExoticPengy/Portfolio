"use client";

import { useEffect, useState } from "react";
import { init, jingle, click } from "@/lib/audio";

type Phase = "idle" | "booting" | "done";

export default function BootSequence() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [show, setShow] = useState(true);

  // Skip if already booted this session (avoids annoying repeat on nav/refresh).
  useEffect(() => {
    try {
      if (sessionStorage.getItem("booted")) setShow(false);
    } catch {
      /* private mode — just show it */
    }
  }, []);

  if (!show || phase === "done") return null;

  const start = () => {
    if (phase !== "idle") return;
    init(); // this click is the audio-unlock gesture
    click(660);
    jingle();
    setPhase("booting");
    setTimeout(() => {
      try { sessionStorage.setItem("booted", "1"); } catch { /* ignore */ }
      setPhase("done");
    }, 1500);
  };

  return (
    <div className={`boot boot-${phase}`} onClick={start} role="button" aria-label="Press start">
      <div className="boot-inner">
        <div className="boot-logo">CHONG&nbsp;MING&nbsp;LI</div>
        {phase === "idle" ? (
          <div className="boot-coin">▶ INSERT COIN</div>
        ) : (
          <div className="boot-loading">
            <span className="boot-bar" />
            <span className="boot-ready">READY</span>
          </div>
        )}
      </div>
    </div>
  );
}
