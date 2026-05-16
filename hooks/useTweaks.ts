"use client";

import { useContext } from "react";
import { TweaksContext } from "@/context/TweaksContext";

export function useTweaks() {
  const ctx = useContext(TweaksContext);
  if (!ctx) throw new Error("useTweaks must be used inside <TweaksProvider>");
  return ctx;
}
