"use client";

import { useEffect, useState } from "react";
import { useTweaks } from "@/hooks/useTweaks";
import { notify } from "@/hooks/useAchievements";
import { motionOk } from "./PixelCanvas";

export type Line = { text: string; n: number }; // n bumps so the same text can be said again

// Typewriter dialogue box. A new line replaces the current one; click finishes it, a second click hides it.
// Screen readers hear the full line once through the live region; the typed text is aria-hidden.
export default function Narrator({ line }: { line: Line | null }) {
  const { tweaks, setTweak } = useTweaks();
  const [shown, setShown] = useState(0);
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState(line);
  const text = line?.text ?? "";

  // Reset during render, not in an effect, so a new line never paints with the old line's count.
  if (line !== cur) {
    setCur(line);
    setOpen(!!line);
    setShown(motionOk() ? 0 : text.length);
  }

  useEffect(() => {
    if (!open) return;
    const t = shown < text.length
      ? setTimeout(() => setShown((s) => s + 1), 28)
      : setTimeout(() => setOpen(false), 4000);
    return () => clearTimeout(t);
  }, [open, shown, text]);

  if (!tweaks.narrator) return null;
  return (
    <>
      <div
        className={`narrator dlg${open ? " on" : ""}`}
        onClick={() => (shown < text.length ? setShown(text.length) : setOpen(false))}
      >
        <span aria-hidden="true">▶ {text.slice(0, shown)}</span>
        <button
          type="button"
          className="narrator-x"
          title="Hide narrator (turn back on in ⚙ Tweaks)"
          onClick={(e) => {
            e.stopPropagation();
            // The box unmounts; hand focus to the section's back button instead of dropping it to body.
            e.currentTarget.closest(".crt")?.querySelector<HTMLElement>(".back")?.focus();
            setTweak("narrator", false);
            notify("NARRATOR OFF · TURN BACK ON IN ⚙ TWEAKS");
          }}
        >
          ✕
        </button>
      </div>
      <div className="sr-only" aria-live="polite">{open ? text : ""}</div>
    </>
  );
}
