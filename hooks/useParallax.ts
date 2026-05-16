"use client";

import { useEffect, type RefObject } from "react";
import type { View } from "@/lib/types";

type MouseRef = { x: number; y: number; tx: number; ty: number };

export function useParallax(
  worldRef: RefObject<HTMLDivElement | null>,
  mouseRef: RefObject<MouseRef>,
  view: View,
  motionIntensity: number,
) {
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const tick = () => {
      const m = mouseRef.current;
      m.x += (m.tx - m.x) * 0.08;
      m.y += (m.ty - m.y) * 0.08;
      if (prefersReduced) {
        if (worldRef.current) worldRef.current.style.transform = "";
      } else if (view === "home" && worldRef.current) {
        const k = motionIntensity / 10;
        worldRef.current.style.transform =
          `rotateX(${-m.y * 12 * k}deg) rotateY(${m.x * 18 * k}deg) translate3d(${m.x * 60 * k}px, ${m.y * 40 * k}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [worldRef, mouseRef, view, motionIntensity]);
}
