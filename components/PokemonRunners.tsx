"use client";

import { useEffect, useRef } from "react";

const POKEMON = [
  { name: "Pikachu",   src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif",  baseSpeed: 35, y: 4, scale: 0.95 },
  { name: "Charmander", src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/4.gif",  baseSpeed: 30, y: 4, scale: 0.95 },
  { name: "Squirtle",  src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/7.gif",  baseSpeed: 28, y: 4, scale: 0.95 },
  { name: "Bulbasaur", src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/1.gif",  baseSpeed: 32, y: 4, scale: 0.95 },
  { name: "Piplup",    src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/393.gif", baseSpeed: 33, y: 4, scale: 0.95 },
];

interface PokemonRunnersProps {
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

export default function PokemonRunners({ onPokemonClick }: PokemonRunnersProps) {
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const statesRef = useRef<State[]>([]);
  const rafRef = useRef(0);

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
        const img = imgRefs.current[i];
        if (!img) continue;

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
        img.style.transform =
          `translateX(${s.x}px) scale(${POKEMON[i].scale}) scaleX(${flip})`;
        img.style.filter =
          `drop-shadow(0 2px 4px rgba(0,0,0,0.5))${idle}`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLImageElement>, name: string) => {
    if (!onPokemonClick) return;
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
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }
        .poke-sprite {
          position: absolute;
          bottom: var(--y);
          image-rendering: pixelated;
          will-change: transform;
          opacity: 0.85;
          transition: opacity 0.3s;
          pointer-events: auto;
        }
        .poke-sprite:hover {
          opacity: 1;
        }
      `}</style>
      <div className="poke-track">
        {POKEMON.map((p, i) => (
          <img
            key={p.name}
            ref={(el) => { imgRefs.current[i] = el; }}
            className="poke-sprite"
            src={p.src}
            alt={p.name}
            title={p.name}
            style={{ "--y": `${p.y}px`, cursor: "pointer" } as React.CSSProperties}
            onClick={(e) => handleClick(e, p.name)}
          />
        ))}
      </div>
    </>
  );
}
