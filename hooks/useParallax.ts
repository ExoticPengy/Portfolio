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
    let last = "";
    const tick = () => {
      const m = mouseRef.current;
      m.x += (m.tx - m.x) * 0.08;
      m.y += (m.ty - m.y) * 0.08;
      // Lite mode (software rendering): tilting the 3D scene repaints it all every frame.
      if ("lite" in document.documentElement.dataset) {
        if (worldRef.current && !worldRef.current.classList.contains("cinematic")) worldRef.current.style.transform = "";
        return;
      }
      if (prefersReduced) {
        if (worldRef.current) worldRef.current.style.transform = "";
      } else if (view === "home" && worldRef.current) {
        const world = worldRef.current;
        // The fly/return transition owns the transform while `cinematic` is set.
        // Writing here every frame re-targets that 800ms transition, so it creeps
        // instead of animating — leave it alone until the transition is done.
        if (!world.classList.contains("cinematic")) {
          const k = motionIntensity / 10;
          const f = (n: number) => n.toFixed(2);
          const t =
            `rotateX(${f(-m.y * 5 * k)}deg) rotateY(${f(m.x * 7 * k)}deg) translate3d(${f(m.x * 20 * k)}px, ${f(m.y * 14 * k)}px, 0px)`;
          // Rounded + compared so a settled mouse stops rewriting (and recompositing) every frame.
          if (t !== last) world.style.transform = last = t;
        } else {
          last = ""; // transition overwrote it; force a write once it ends
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [worldRef, mouseRef, view, motionIntensity]);
}
