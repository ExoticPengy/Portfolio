"use client";

import { useEffect, useRef } from "react";
import { init, setEnabled } from "@/lib/audio";

export function useAudio(soundEnabled: boolean) {
  const ready = useRef(false);

  // Reflect tweak into module flag
  useEffect(() => { setEnabled(soundEnabled); }, [soundEnabled]);

  // Init AudioContext on first user gesture
  useEffect(() => {
    const handler = () => {
      if (!ready.current) {
        init();
        ready.current = true;
      }
    };
    window.addEventListener("click", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);
}
