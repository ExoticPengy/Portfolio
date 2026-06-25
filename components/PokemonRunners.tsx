"use client";

import { useEffect, useRef, useMemo } from "react";
import { useTweaks } from "@/hooks/useTweaks";

// Evolution chains: [base, stage1, stage2] — PokeAPI sprite IDs
const EVO_CHAIN: Record<string, number[]> = {
  bulbasaur:  [1, 2, 3],   // Bulbasaur → Ivysaur → Venusaur
  charmander: [4, 5, 6],   // Charmander → Charmeleon → Charizard
  squirtle:   [7, 8, 9],   // Squirtle → Wartortle → Blastoise
};

const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated";

function getEvoStage(name: string, level: number): number {
  const chain = EVO_CHAIN[name.toLowerCase()];
  if (!chain) return 0;
  if (level >= 72) return 2;
  if (level >= 32) return 1;
  return 0;
}

function getSpriteUrl(name: string, level: number, fallbackId: number, shiny: boolean): string {
  const dir = shiny ? `${SPRITE_BASE}/shiny` : SPRITE_BASE;
  const chain = EVO_CHAIN[name.toLowerCase()];
  if (!chain) return `${dir}/${fallbackId}.gif`;
  const stage = getEvoStage(name, level);
  return `${dir}/${chain[stage]}.gif`;
}

interface PokemonDef {
  name: string;
  fallbackId: number;
  baseSpeed: number;
  y: number;
  scale: number;
}

const POKEMON: PokemonDef[] = [
  { name: "Pikachu",   fallbackId: 25,  baseSpeed: 35, y: 4, scale: 0.95 },
  { name: "Charmander", fallbackId: 4,  baseSpeed: 30, y: 4, scale: 0.95 },
  { name: "Squirtle",  fallbackId: 7,  baseSpeed: 28, y: 4, scale: 0.95 },
  { name: "Bulbasaur", fallbackId: 1,  baseSpeed: 32, y: 4, scale: 0.95 },
  { name: "Piplup",    fallbackId: 393, baseSpeed: 33, y: 4, scale: 0.95 },
];

const EVO_NAMES: Record<string, string[]> = {
  bulbasaur:  ["Bulbasaur", "Ivysaur", "Venusaur"],
  charmander: ["Charmander", "Charmeleon", "Charizard"],
  squirtle:   ["Squirtle", "Wartortle", "Blastoise"],
};

interface PokemonRunnersProps {
  level: number;
  onPokemonClick?: (name: string, x: number, y: number) => void;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h) / 0x7fffffff;
}

type State = {
  x: number;
  dir: number;       // 1=right, -1=left
  speed: number;     // px/s
  changeTimer: number;
  isStopped: boolean;
  stopTimer: number;
};

export default function PokemonRunners({ level, onPokemonClick }: PokemonRunnersProps) {
  const { tweaks } = useTweaks();
  const shiny = tweaks.shiny;
  const wrapperRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const statesRef = useRef<State[]>([]);
  const rafRef = useRef(0);
  const prevStageRef = useRef<Record<string, number>>({});

  // Compute current sprite URLs based on level
  const sprites = useMemo(
    () => POKEMON.map((p) => getSpriteUrl(p.name, level, p.fallbackId, shiny)),
    [level, shiny]
  );

  // Track evolutions for flash effect
  const displayNames = useMemo(
    () => POKEMON.map((p) => {
      const key = p.name.toLowerCase();
      const chain = EVO_NAMES[key];
      if (!chain) return p.name;
      const stage = getEvoStage(p.name, level);
      return chain[stage];
    }),
    [level]
  );

  // Detect evolution changes — CSS animation flash
  useEffect(() => {
    for (const p of POKEMON) {
      const key = p.name.toLowerCase();
      const chain = EVO_CHAIN[key];
      if (!chain) continue;
      const stage = getEvoStage(p.name, level);
      const prev = prevStageRef.current[key] ?? 0;
      if (stage > prev) {
        const idx = POKEMON.indexOf(p);
        const img = imgRefs.current[idx];
        if (!img) continue;

        // Trigger CSS animation: flash → glow → settle
        img.classList.add("evo-flash");
        setTimeout(() => {
          img?.classList.remove("evo-flash");
        }, 700);
      }
      prevStageRef.current[key] = stage;
    }
  }, [level]);

  useEffect(() => {
    const w = window.innerWidth;

    // Initialize deterministic but staggered states
    statesRef.current = POKEMON.map((p, i) => ({
      x: hash(p.name + "pos") * w,
      dir: hash(p.name + "dir") > 0.5 ? 1 : -1,
      speed: p.baseSpeed * (0.7 + hash(p.name + "spd") * 0.6), // 70%-130% base
      changeTimer: 2 + hash(p.name + "ct") * 8,               // 2-10s until next decision
      isStopped: false,
      stopTimer: 0,
    }));

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      for (let i = 0; i < POKEMON.length; i++) {
        const s = statesRef.current[i];
        const wrapper = wrapperRefs.current[i];
        const img = imgRefs.current[i];
        if (!wrapper || !img) continue;

        s.changeTimer -= dt;

        if (s.isStopped) {
          s.stopTimer -= dt;
          if (s.stopTimer <= 0) {
            s.isStopped = false;
            s.changeTimer = 2 + Math.random() * 8;
            // 60% chance to switch direction after stopping
            if (Math.random() < 0.6) s.dir *= -1;
            s.speed = POKEMON[i].baseSpeed * (0.7 + Math.random() * 0.6);
          }
        } else {
          if (s.changeTimer <= 0) {
            // 40% chance to stop, 20% to switch direction, 40% to just keep going
            const roll = Math.random();
            if (roll < 0.4) {
              s.isStopped = true;
              s.stopTimer = 0.8 + Math.random() * 4.5; // stop 0.8-5.3 seconds
            } else {
              s.changeTimer = 2 + Math.random() * 8;
              if (roll < 0.6) s.dir *= -1;             // 20% direction switch
              s.speed = POKEMON[i].baseSpeed * (0.7 + Math.random() * 0.6);
            }
          }
        }

        if (!s.isStopped) {
          const margin = 100;
          s.x += s.speed * s.dir * dt;
          if (s.x > w + margin) s.x = -margin;
          if (s.x < -margin) s.x = w + margin;
        }

        const flip = s.dir === 1 ? -1 : 1; // sprite faces left natively
        const idle = s.isStopped ? " grayscale(0.2)" : "";

        wrapper.style.transform =
          `translateX(${s.x}px) scale(${POKEMON[i].scale}) scaleX(${flip})`;

        if (!img.classList.contains("evo-flash")) {
          img.style.filter =
            `drop-shadow(0 2px 4px rgba(0,0,0,0.5))${idle}`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>, name: string) => {
    if (!onPokemonClick) return;

    // Attack animation on inner target — force restart via reflow
    const atk = e.currentTarget.firstElementChild;
    if (atk) {
      atk.classList.remove("poke-attack");
      void (atk as HTMLElement).offsetWidth; // force reflow to restart animation
      atk.classList.add("poke-attack");
    }

    onPokemonClick(name, e.clientX, e.clientY);
  };

  return (
    <>
      <style>{`
        .poke-track {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          z-index: 5;
          pointer-events: none;
          overflow: visible;
        }
        .poke-sprite {
          image-rendering: pixelated;
          opacity: 0.85;
          transition: opacity 0.3s;
          display: block;
        }
        .poke-sprite:hover {
          opacity: 1;
        }
        .evo-flash {
          animation: evo-pulse 0.7s ease-out;
        }
        @keyframes evo-pulse {
          0%   { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)) brightness(1); }
          15%  { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)) brightness(4) drop-shadow(0 0 30px white); }
          30%  { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)) brightness(3) drop-shadow(0 0 20px white); }
          60%  { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)) brightness(1.5) drop-shadow(0 0 8px rgba(255,255,255,0.5)); }
          100% { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)) brightness(1); }
        }
        .poke-wrapper {
          position: absolute;
          bottom: var(--y);
          will-change: transform;
          pointer-events: auto;
        }
        .poke-attack-target {
          display: inline-block;
        }
        .poke-attack-target.poke-attack {
          animation: atk-lunge 0.5s ease-out;
        }
        @keyframes atk-lunge {
          0%   { transform: translateY(0) scale(1); filter: brightness(1); }
          15%  { transform: translateY(-12px) scale(1.25); filter: brightness(1.6); }
          30%  { transform: translateX(6px) scale(0.9);  filter: brightness(1); }
          45%  { transform: translateX(-6px) scale(1.05); }
          60%  { transform: translateX(3px) scale(0.98); }
          75%  { transform: translateX(-2px) scale(1); }
          100% { transform: translateX(0) scale(1); }
        }
      `}</style>
      <div className="poke-track">
        {POKEMON.map((p, i) => (
          <span
            key={p.name}
            ref={(el) => { wrapperRefs.current[i] = el; }}
            className="poke-wrapper"
            style={{ "--y": `${p.y}px`, cursor: "pointer" } as React.CSSProperties}
            onClick={(e) => handleClick(e, displayNames[i])}
          >
            <span className="poke-attack-target">
              <img
                ref={(el) => { imgRefs.current[i] = el; }}
                className="poke-sprite"
                src={sprites[i]}
                alt={displayNames[i]}
                title={displayNames[i]}
              />
            </span>
          </span>
        ))}
      </div>
    </>
  );
}
