"use client";

import { useEffect } from "react";
import { useAchievements, nextToast } from "@/hooks/useAchievements";
import { jingle } from "@/lib/audio";

// One toast at a time; several fresh unlocks play in sequence.
export default function AchievementToast() {
  const { toast } = useAchievements();
  useEffect(() => {
    if (!toast) return;
    if (toast.jingle) jingle();
    const t = setTimeout(nextToast, 2600);
    return () => clearTimeout(t);
  }, [toast]);
  return toast ? <div key={toast.id} className="shiny-toast" role="status">{toast.text}</div> : null;
}
