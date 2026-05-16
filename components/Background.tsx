"use client";
import { useTweaks } from "@/hooks/useTweaks";

export function BackgroundBurst() {
  const { tweaks } = useTweaks();
  if (!tweaks.sunburst) return null;
  return (
    <>
      <div className="bg-burst" />
      <div className="bg-burst alt" />
    </>
  );
}

export function BackgroundFx() {
  const { tweaks } = useTweaks();
  return (
    <>
      {tweaks.scanlines && <div className="bg-scanlines" />}
      {tweaks.grain && <div className="bg-noise" />}
    </>
  );
}
