"use client";

import {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  type MovePool,
  fetchMovePool,
  pickRandomMove,
  getTypeColor,
  getFallbackPool,
} from "@/lib/moves";

// ---- Particle types --------------------------------------------------------

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface TextBubble {
  text: string;
  alpha: number;
  yOffset: number;
}

// ---- Per-type particle spawners --------------------------------------------

function spawnElectric(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 30 + Math.random() * 30,
      maxLife: 60,
      color,
      size: 2 + Math.random() * 3,
    });
  }
  // Branching lightning bolts — 3-5 line segments
  for (let b = 0; b < 4; b++) {
    const angle = (Math.PI * 2 * b) / 4 + (Math.random() - 0.5) * 0.8;
    for (let s = 0; s < 5; s++) {
      const dist = 20 + s * 25;
      particles.push({
        x: x + Math.cos(angle) * dist + (Math.random() - 0.5) * 30,
        y: y + Math.sin(angle) * dist + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        life: 10 + Math.random() * 15,
        maxLife: 25,
        color: "#FFFBE6",
        size: 1 + Math.random() * 2,
      });
    }
  }
  return particles;
}

function spawnFire(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 35; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 2,
      vy: -2 - Math.random() * 4,
      life: 20 + Math.random() * 30,
      maxLife: 50,
      color: Math.random() > 0.5 ? "#FF4500" : "#FFD700",
      size: 3 + Math.random() * 5,
    });
  }
  return particles;
}

function spawnWater(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 30; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const speed = 1 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + 1,
      life: 25 + Math.random() * 25,
      maxLife: 50,
      color,
      size: 2 + Math.random() * 4,
    });
  }
  return particles;
}

function spawnGrass(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 25; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      life: 30 + Math.random() * 35,
      maxLife: 65,
      color,
      size: 3 + Math.random() * 3,
    });
  }
  return particles;
}

function spawnNormal(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 25; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 3.5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 25 + Math.random() * 25,
      maxLife: 50,
      color,
      size: 2 + Math.random() * 3,
    });
  }
  return particles;
}

const SPAWNERS: Record<string, (x: number, y: number, color: string) => Particle[]> = {
  electric: spawnElectric,
  fire: spawnFire,
  water: spawnWater,
  grass: spawnGrass,
};

const DEFAULT_SPAWNER = spawnNormal;

// ---- Component --------------------------------------------------------------

export interface MoveFxHandle {
  trigger: (x: number, y: number, pokemonName: string) => void;
}

interface CooldownState {
  until: number;
  pool: MovePool | null;
}

export default forwardRef<MoveFxHandle>(function MoveFx(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const bubblesRef = useRef<TextBubble[]>([]);
  const cooldownsRef = useRef<Map<string, CooldownState>>(new Map());
  const rafRef = useRef(0);
  const poolsRef = useRef<Map<string, MovePool>>(new Map());

  // ---- Animation loop -------------------------------------------------------

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Particles
    const ps = particlesRef.current;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.life--;

      if (p.life <= 0) {
        ps.splice(i, 1);
        continue;
      }

      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.5 + 0.5 * alpha), 0, Math.PI * 2);
      ctx.fill();
    }

    // Text bubbles
    const bs = bubblesRef.current;
    for (let i = bs.length - 1; i >= 0; i--) {
      const b = bs[i];
      b.yOffset -= 0.5;
      b.alpha -= 0.012;

      if (b.alpha <= 0) {
        bs.splice(i, 1);
        continue;
      }

      const y = b.yOffset - 60;
      ctx.globalAlpha = b.alpha;
      ctx.font = "bold 14px var(--font-mono, monospace)";
      ctx.textAlign = "center";

      // Outline
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.strokeText(b.text, 0, y);

      // Fill
      ctx.fillStyle = "#FFF";
      ctx.fillText(b.text, 0, y);
    }

    ctx.globalAlpha = 1;

    if (ps.length > 0 || bs.length > 0) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      rafRef.current = 0;
    }
  }, []);

  // ---- Resize handler -------------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);

  // ---- Trigger --------------------------------------------------------------

  const trigger = useCallback(
    async (x: number, y: number, pokemonName: string) => {
      const key = pokemonName.toLowerCase();
      const now = performance.now();

      const cd = cooldownsRef.current.get(key);
      if (cd && now < cd.until) return;

      // Set cooldown before async fetch so rapid clicks don't stack requests
      const until = now + 800;
      const existingCd = cd ?? { until: 0, pool: null };
      cooldownsRef.current.set(key, { until, pool: existingCd.pool });

      // Use cached pool if available
      let pool = poolsRef.current.get(key) ?? null;
      if (!pool) {
        pool = await fetchMovePool(pokemonName);
        poolsRef.current.set(key, pool);
      }

      const moveName = pickRandomMove(pool);
      const color = getTypeColor(pool.primaryType);
      const spawner = SPAWNERS[pool.primaryType] ?? DEFAULT_SPAWNER;

      // Translate click to canvas coords (they match since canvas is full-screen)
      const spawnX = x;
      const spawnY = y;

      const newParticles = spawner(spawnX, spawnY, color);
      particlesRef.current.push(...newParticles);

      bubblesRef.current.push({
        text: `${pokemonName} used ${moveName}!`,
        alpha: 1,
        yOffset: spawnY,
      });

      // Start animation if not already running
      if (rafRef.current === 0) {
        rafRef.current = requestAnimationFrame(animate);
      }
    },
    [animate]
  );

  useImperativeHandle(ref, () => ({ trigger }), [trigger]);

  // ---- Cleanup --------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="move-fx-canvas"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        pointerEvents: "none",
      }}
    />
  );
});
