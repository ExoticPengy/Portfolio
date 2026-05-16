"use client";

import { useEffect } from "react";
import { PANELS } from "@/lib/panels";
import type { PanelData, View } from "@/lib/types";

type Args = {
  view: View;
  keyboardIdx: number;
  setKeyboardIdx: (i: number) => void;
  fly: (panel: PanelData) => void;
  back: () => void;
  onMove?: () => void;
};

export function useKeyboardNav({ view, keyboardIdx, setKeyboardIdx, fly, back, onMove }: Args) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (view !== "home" && view !== "flying") {
        if (e.key === "Escape") back();
        return;
      }
      if (view === "flying") return;

      // Quadrant model: 0=TL, 1=TR, 2=BL, 3=BR
      let idx = keyboardIdx;
      if (e.key === "ArrowRight") idx = idx % 2 === 0 ? idx + 1 : idx;
      else if (e.key === "ArrowLeft") idx = idx % 2 === 1 ? idx - 1 : idx;
      else if (e.key === "ArrowDown") idx = idx < 2 ? idx + 2 : idx;
      else if (e.key === "ArrowUp") idx = idx >= 2 ? idx - 2 : idx;
      else if (e.key === "Enter" || e.key === " ") { fly(PANELS[idx]); return; }
      else return;

      if (idx !== keyboardIdx) {
        setKeyboardIdx(idx);
        onMove?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, keyboardIdx, setKeyboardIdx, fly, back, onMove]);
}
