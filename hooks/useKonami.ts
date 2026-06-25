"use client";

import { useEffect } from "react";

const SEQ = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

export function useKonami(onUnlock: () => void) {
  useEffect(() => {
    let i = 0;
    const handler = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === SEQ[i]) {
        i++;
        if (i === SEQ.length) { i = 0; onUnlock(); }
      } else {
        // restart, but allow this key to be a fresh first step
        i = k === SEQ[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onUnlock]);
}
