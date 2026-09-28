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
  // The live region stays mounted; screen readers skip regions that arrive already filled.
  return (
    <div role="status">
      {toast && <div key={toast.id} className="shiny-toast">{toast.text}</div>}
    </div>
  );
}
