"use client";

import { useCallback, type RefObject } from "react";
import type { PanelData, View } from "@/lib/types";

type Args = {
  view: View;
  setView: (v: View) => void;
  setFocusedId: (id: string | null) => void;
  worldRef: RefObject<HTMLDivElement | null>;
  flashRef: RefObject<HTMLDivElement | null>;
  streakRef: RefObject<HTMLDivElement | null>;
  motionIntensity: number;
  onFlyStart?: (intensity: number) => void;
  onFlyEnd?: () => void;
  onBackStart?: () => void;
};

export function useFlyTransition({
  view, setView, setFocusedId, worldRef, flashRef, streakRef, motionIntensity,
  onFlyStart, onFlyEnd, onBackStart,
}: Args) {
  const fly = useCallback((panel: PanelData) => {
    if (view !== "home") return;
    onFlyStart?.(motionIntensity);

    setView("flying");
    setFocusedId(panel.id);

    const world = worldRef.current;
    if (world) {
      const intensity = motionIntensity;
      const duration = 850 - intensity * 15;
      world.classList.add("cinematic");
      world.style.transition = `transform ${duration}ms cubic-bezier(0.7, 0, 0.15, 1)`;
      const zPush = 700 + intensity * 50;
      const ry = -panel.ry * (0.5 + intensity / 20);
      const rx = -panel.rx * (0.5 + intensity / 20);
      world.style.transform =
        `translate3d(${-panel.x}px, ${-panel.y}px, ${zPush}px) rotateY(${ry}deg) rotateX(${rx}deg)`;
    }

    const flash = flashRef.current;
    const streak = streakRef.current;
    if (flash) { flash.classList.remove("fire"); void flash.offsetWidth; flash.classList.add("fire"); }
    if (streak) { streak.classList.remove("fire"); void streak.offsetWidth; streak.classList.add("fire"); }

    setTimeout(() => {
      onFlyEnd?.();
      setView(panel.id);
    }, 700);
  }, [view, motionIntensity, setView, setFocusedId, worldRef, flashRef, streakRef, onFlyStart, onFlyEnd]);

  const back = useCallback(() => {
    if (view === "home" || view === "flying") return;
    onBackStart?.();
    setView("home");
    setFocusedId(null);
    const world = worldRef.current;
    if (world) {
      world.classList.add("cinematic");
      world.style.transition = "transform 800ms cubic-bezier(0.2, 0.7, 0.2, 1)";
      world.style.transform = "translate3d(0,0,0)";
      setTimeout(() => {
        if (world) {
          world.classList.remove("cinematic");
          world.style.transition = "";
        }
      }, 850);
    }
  }, [view, setView, setFocusedId, worldRef, onBackStart]);

  return { fly, back };
}
