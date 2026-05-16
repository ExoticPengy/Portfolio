"use client";

import { useTweaks } from "@/hooks/useTweaks";

export default function Background() {
  const { tweaks } = useTweaks();
  return (
    <>
      {tweaks.sunburst && <div className="bg-burst" />}
      {tweaks.sunburst && <div className="bg-burst alt" />}
      {tweaks.scanlines && <div className="bg-scanlines" />}
      {tweaks.grain && <div className="bg-noise" />}
    </>
  );
}
