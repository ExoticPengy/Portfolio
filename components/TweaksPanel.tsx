"use client";

import { useState } from "react";
import { useTweaks } from "@/hooks/useTweaks";
import { PALETTE_OPTIONS } from "@/lib/palettes";
import type { PaletteName } from "@/lib/types";

export default function TweaksPanel({ onResetLevel }: { onResetLevel?: () => void }) {
  const { tweaks, setTweak } = useTweaks();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed", right: 24, bottom: 64, zIndex: 50,
          fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em",
          padding: "8px 14px", color: "var(--accent-2)",
          background: "color-mix(in oklab, var(--bg-0) 70%, transparent)",
          border: "1px solid color-mix(in oklab, var(--accent-2) 55%, transparent)",
          textTransform: "uppercase", cursor: "pointer",
        }}
      >
        {open ? "× CLOSE" : "⚙ TWEAKS"}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Tweaks"
          style={{
            position: "fixed", right: 24, bottom: 110, zIndex: 50,
            width: 280, padding: 18,
            maxHeight: "calc(100vh - 134px)", overflowY: "auto",
            background: "color-mix(in oklab, var(--bg-0) 92%, transparent)",
            border: "1px solid color-mix(in oklab, var(--accent) 35%, transparent)",
            color: "var(--fg)", fontFamily: "var(--font-mono)", fontSize: 11,
            display: "flex", flexDirection: "column", gap: 14,
          }}
        >
          <Section label="LOOK" />
          <Row label="Palette">
            <select
              value={tweaks.palette}
              onChange={(e) => setTweak("palette", e.target.value as PaletteName)}
              style={selectStyle}
            >
              {PALETTE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Row>
          <Toggle label="Sunburst"   value={tweaks.sunburst}   onChange={(v) => setTweak("sunburst", v)} />
          <Toggle label="Scanlines"  value={tweaks.scanlines}  onChange={(v) => setTweak("scanlines", v)} />
          <Toggle label="Film Grain" value={tweaks.grain}      onChange={(v) => setTweak("grain", v)} />

          <Section label="MOTION" />
          <Row label={`Intensity · ${tweaks.motionIntensity}`}>
            <input
              type="range" className="tw-range" min={0} max={10} step={1}
              value={tweaks.motionIntensity}
              onChange={(e) => setTweak("motionIntensity", Number(e.target.value))}
              style={{ width: 120, flex: "none" }}
            />
          </Row>

          <Section label="AUDIO" />
          <Toggle label="UI Sounds" value={tweaks.soundEnabled} onChange={(v) => setTweak("soundEnabled", v)} />
          <Row label={`SFX Vol · ${tweaks.sfxVolume}`}>
            <input
              type="range" className="tw-range" min={0} max={10} step={1}
              value={tweaks.sfxVolume}
              onChange={(e) => setTweak("sfxVolume", Number(e.target.value))}
              style={{ width: 120, flex: "none" }}
            />
          </Row>
          <Toggle label="Music"     value={tweaks.musicEnabled} onChange={(v) => setTweak("musicEnabled", v)} />
          <Row label={`Music Vol · ${tweaks.musicVolume}`}>
            <input
              type="range" className="tw-range" min={0} max={10} step={1}
              value={tweaks.musicVolume}
              onChange={(e) => setTweak("musicVolume", Number(e.target.value))}
              style={{ width: 120, flex: "none" }}
            />
          </Row>

          <Section label="INTRO" />
          <Row label="Boot Video">
            <button
              type="button"
              onClick={() => { try { sessionStorage.removeItem("booted"); } catch { /* ignore */ } location.reload(); }}
              style={{
                background: "transparent",
                color: "var(--fg)",
                border: "1px solid color-mix(in oklab, var(--accent) 55%, transparent)",
                padding: "3px 10px",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              REPLAY
            </button>
          </Row>

          {onResetLevel && (
            <>
              <Section label="POKEMON" />
              <Row label="Evo Level">
                <button
                  type="button"
                  onClick={onResetLevel}
                  style={{
                    background: "transparent",
                    color: "var(--fg)",
                    border: "1px solid color-mix(in oklab, var(--accent) 55%, transparent)",
                    padding: "3px 10px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    cursor: "pointer",
                    letterSpacing: "0.1em",
                  }}
                >
                  RESET
                </button>
              </Row>
            </>
          )}
        </div>
      )}
    </>
  );
}

const selectStyle: React.CSSProperties = {
  background: "var(--bg-0)", color: "var(--fg)",
  border: "1px solid color-mix(in oklab, var(--accent) 35%, transparent)",
  padding: "4px 8px", fontFamily: "var(--font-mono)", fontSize: 11,
};

function Section({ label }: { label: string }) {
  return <div style={{ color: "var(--accent)", letterSpacing: "0.25em", fontWeight: 700 }}>{`// ${label}`}</div>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <span style={{ opacity: 0.7 }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row label={label}>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          background: value ? "var(--accent)" : "transparent",
          color: value ? "var(--bg-0)" : "var(--fg)",
          border: "1px solid color-mix(in oklab, var(--accent) 55%, transparent)",
          padding: "3px 10px", fontFamily: "var(--font-mono)", fontSize: 10,
          cursor: "pointer", letterSpacing: "0.1em",
        }}
      >
        {value ? "ON" : "OFF"}
      </button>
    </Row>
  );
}
