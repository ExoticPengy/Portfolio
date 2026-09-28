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
  const text = line?.text ?? "";

  useEffect(() => {
    if (!line) return;
    setOpen(true);
    setShown(motionOk() ? 0 : line.text.length);
  }, [line]);

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
