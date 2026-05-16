"use client";

import { useEffect } from "react";

export function useResponsiveScale() {
  useEffect(() => {
    const update = () => {
      const sX = (window.innerWidth - 40) / 1300;
      const sY = (window.innerHeight - 40) / 940;
      const s = Math.min(1, Math.max(0.4, Math.min(sX, sY)));
      document.documentElement.style.setProperty("--world-scale", String(s));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
}
