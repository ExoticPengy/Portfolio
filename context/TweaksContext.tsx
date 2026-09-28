"use client";

import { createContext, useEffect, useRef, useState, type ReactNode } from "react";
import { DEFAULT_TWEAKS, type Tweaks } from "@/lib/types";

const STORAGE_KEY = "portfolio.tweaks";

type Ctx = {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;
};

export const TweaksContext = createContext<Ctx | null>(null);

export function TweaksProvider({ children }: { children: ReactNode }) {
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULT_TWEAKS);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Tweaks>;
        setTweaks((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // localStorage disabled / private mode — fall back to defaults
    }
  }, []);

  // Persist — debounced so dragging a slider doesn't write on every tick
  // (synchronous localStorage writes janked the controlled inputs).
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tweaks));
      } catch {
        // ignore
      }
    }, 200);
    return () => clearTimeout(id);
  }, [tweaks]);

  // Apply palette to <body data-palette>
  useEffect(() => {
    document.body.dataset.palette = tweaks.palette;
  }, [tweaks.palette]);

  // Shiny easter egg — alternate coloration via <body data-shiny>
  useEffect(() => {
    if (tweaks.shiny) document.body.dataset.shiny = "true";
    else delete document.body.dataset.shiny;
  }, [tweaks.shiny]);

  // Lite mode switch. The first run is skipped: the head probe already applied the stored choice before paint.
  // ponytail: picking Auto after On/Off at load has no verdict to restore until the next reload re-probes.
  const liteInit = useRef(true);
  useEffect(() => {
    if (liteInit.current) { liteInit.current = false; return; }
    const d = document.documentElement.dataset;
    const on = tweaks.lite === "on" || (tweaks.lite === "auto" && "liteAuto" in d);
    if (on) d.lite = "";
    else delete d.lite;
  }, [tweaks.lite]);

  const setTweak: Ctx["setTweak"] = (key, value) => {
    setTweaks((prev) => ({ ...prev, [key]: value }));
  };

  return <TweaksContext.Provider value={{ tweaks, setTweak }}>{children}</TweaksContext.Provider>;
}
