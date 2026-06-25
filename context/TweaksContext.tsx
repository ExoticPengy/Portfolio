"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
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

  const setTweak: Ctx["setTweak"] = (key, value) => {
    setTweaks((prev) => ({ ...prev, [key]: value }));
  };

  return <TweaksContext.Provider value={{ tweaks, setTweak }}>{children}</TweaksContext.Provider>;
}
