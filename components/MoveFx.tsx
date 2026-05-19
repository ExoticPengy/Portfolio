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
  getPool,
  pickRandomMove,
  getTypeColor,
} from "@/lib/moves";

// ---- Particle types --------------------------------------------------------

type ParticleShape = "circle" | "bolt" | "leaf" | "streak";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  shape: ParticleShape;
  va?: number;
  angle?: number;
  boltLen?: number;
  boltAngle?: number;
  // For streak: rendered as line in velocity direction
}

interface TextBubble {
  text: string;
  alpha: number;
  x: number;
  yOffset: number;
}

// ---- Utility helpers -------------------------------------------------------

function rng(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randColor(...colors: string[]) {
  return colors[Math.floor(Math.random() * colors.length)];
}

// ============================================================================
// PIKACHU — Electric
// ============================================================================

function spawnThunderbolt(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];
  const boltColor = "#FFD700";
  const baseAngle = -Math.PI / 2 + rng(-0.3, 0.3);

  // 3 main bolts fanning outward — each a zigzag chain
  for (let boltIdx = 0; boltIdx < 3; boltIdx++) {
    const mainAngle = baseAngle + (boltIdx - 1) * rng(0.2, 0.45);
    let cx = x;
    let cy = y;
    let dist = 0;
    const maxDist = 130 + rng(0, 60);
    while (dist < maxDist) {
      const segLen = rng(8, 20);
      const a = mainAngle + rng(-0.45, 0.45);
      cx += Math.cos(a) * segLen;
      cy += Math.sin(a) * segLen;
      dist += segLen;
      ps.push({
        x: cx, y: cy,
        vx: rng(-0.3, 0.3), vy: rng(-0.3, 0.3),
        life: rng(12, 22), maxLife: 28,
        color: randColor("#FFFBE6", boltColor, "#FFF"),
        size: rng(2, 4),
        shape: "bolt", boltLen: segLen * 0.85, boltAngle: a + rng(-0.3, 0.3),
      });
    }

    // 5-7 branches per main bolt
    const branchCount = 5 + Math.floor(Math.random() * 3);
    for (let b = 0; b < branchCount; b++) {
      const branchOrigin = rng(20, maxDist * 0.75);
      let bx = x + Math.cos(mainAngle) * branchOrigin;
      let by = y + Math.sin(mainAngle) * branchOrigin;
      const bAngle = mainAngle + rng(-1.2, 1.2);
      let bd = 0;
      const bMax = rng(25, 60);
      while (bd < bMax) {
        const segLen = rng(5, 12);
        const a = bAngle + rng(-0.5, 0.5);
        bx += Math.cos(a) * segLen;
        by += Math.sin(a) * segLen;
        bd += segLen;
        ps.push({
          x: bx, y: by,
          vx: rng(-0.2, 0.2), vy: rng(-0.2, 0.2),
          life: rng(8, 16), maxLife: 20,
          color: "#FFFBE6",
          size: rng(1, 2.5),
          shape: "bolt", boltLen: segLen * 0.7, boltAngle: a + rng(-0.2, 0.2),
        });
      }
    }
  }

  // Spark scatter — wider fan
  for (let i = 0; i < 35; i++) {
    const a = baseAngle + rng(-1.8, 1.8);
    const spd = rng(2, 7);
    ps.push({
      x, y,
      vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
      life: rng(20, 40), maxLife: 45,
      color: boltColor, size: rng(1.5, 3),
      shape: "circle",
    });
  }

  return ps;
}

function spawnVoltTackle(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];

  // Expanding electric rings
  for (let ring = 0; ring < 3; ring++) {
    const ringDelay = ring * 5;
    const ringRadius = 15 + ring * 25;
    const count = 12 + ring * 8;
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count;
      const r = ringRadius;
      ps.push({
        x: x + Math.cos(a) * r,
        y: y + Math.sin(a) * r,
        vx: Math.cos(a) * rng(2.5, 5),
        vy: Math.sin(a) * rng(2.5, 5),
        life: 25 + ringDelay - ring * 3,
        maxLife: 30 + ringDelay,
        color: randColor("#FFD700", "#FFFBE6", "#FFA500"),
        size: rng(2, 4),
        shape: "circle",
      });
    }
  }

  // Central flash burst
  for (let i = 0; i < 30; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = rng(3, 8);
    ps.push({
      x, y,
      vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
      life: rng(10, 25), maxLife: 30,
      color: randColor("#FFF", "#FFD700", "#FFFBE6"),
      size: rng(1.5, 4),
      shape: "circle",
    });
  }

  // Trailing lightning streaks
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = rng(4, 12);
    ps.push({
      x: x + rng(-15, 15), y: y + rng(-10, 10),
      vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - rng(1, 3),
      life: rng(10, 22), maxLife: 26,
      color: "#FFD700", size: rng(1, 3),
      shape: "streak",
    });
  }

  return ps;
}

function spawnElectroBall(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];

  // Concentrated spinning orb
  for (let i = 0; i < 24; i++) {
    const a = (Math.PI * 2 * i) / 24;
    const r = rng(10, 35);
    ps.push({
      x: x + Math.cos(a) * r,
      y: y + Math.sin(a) * r,
      vx: Math.cos(a) * rng(1, 3),
      vy: Math.sin(a) * rng(1, 3),
      life: rng(20, 40), maxLife: 45,
      color: randColor("#FFD700", "#FFF", "#FFFBE6"),
      size: rng(2, 5),
      shape: "circle",
      va: rng(0.03, 0.08) * (Math.random() > 0.5 ? 1 : -1),
    });
  }

  // Outer spark ring
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = rng(1.5, 3.5);
    ps.push({
      x, y,
      vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
      life: rng(20, 35), maxLife: 40,
      color: "#FFFBE6", size: rng(1, 2),
      shape: "circle",
    });
  }

  return ps;
}

// ============================================================================
// CHARMANDER — Fire
// ============================================================================

function spawnFlamethrower(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];
  const jetAngle = Math.random() * Math.PI * 2;

  // Fire jet stream — longer, more particles
  for (let i = 0; i < 65; i++) {
    const dist = rng(0, 120);
    const spread = rng(-18, 18);
    const cx = x + Math.cos(jetAngle) * dist + Math.cos(jetAngle + Math.PI / 2) * spread;
    const cy = y + Math.sin(jetAngle) * dist + Math.sin(jetAngle + Math.PI / 2) * spread;
    ps.push({
      x: cx, y: cy,
      vx: Math.cos(jetAngle) * rng(0.5, 2.5),
      vy: Math.sin(jetAngle) * rng(0.5, 2.5) - rng(1, 3),
      life: rng(20, 50), maxLife: 60,
      color: randColor("#FF4500", "#FF6347", "#FFD700", "#FFA500"),
      size: rng(3, 7),
      shape: "circle",
    });
  }

  // Smoke wisps at edges
  for (let i = 0; i < 16; i++) {
    ps.push({
      x: x + rng(-25, 25), y: y + rng(-25, 25),
      vx: rng(-0.5, 0.5), vy: rng(-1.5, 0.5),
      life: rng(30, 55), maxLife: 60,
      color: "#888",
      size: rng(2, 5),
      shape: "circle",
    });
  }

  return ps;
}

function spawnFireSpin(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];

  // Spiral fire vortex
  for (let i = 0; i < 45; i++) {
    const t = i / 45;
    const a = t * Math.PI * 3 + rng(-0.2, 0.2);
    const r = 5 + t * 50;
    const cx = x + Math.cos(a) * r;
    const cy = y + Math.sin(a) * r - t * 30;
    ps.push({
      x: cx, y: cy,
      vx: Math.cos(a + Math.PI / 2) * rng(0.5, 2),
      vy: Math.sin(a + Math.PI / 2) * rng(0.5, 2) - rng(1, 3),
      life: rng(20, 45), maxLife: 55,
      color: randColor("#FF4500", "#FF6347", "#FFD700"),
      size: rng(2, 5) * (1 - t * 0.5),
      shape: "circle",
    });
  }

  return ps;
}

function spawnEmber(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];

  // Small scattered fireballs drifting upward
  for (let i = 0; i < 30; i++) {
    const a = rng(-1.2, 1.2) - Math.PI / 2;
    const spd = rng(1, 3);
    ps.push({
      x: x + rng(-20, 20), y: y + rng(-5, 5),
      vx: Math.cos(a) * spd + rng(-0.5, 0.5),
      vy: Math.sin(a) * spd - rng(1, 3),
      life: rng(25, 50), maxLife: 60,
      color: randColor("#FF4500", "#FFA500", "#FF6347"),
      size: rng(2, 4),
      shape: "circle",
    });
  }

  return ps;
}

// ============================================================================
// SQUIRTLE — Water
// ============================================================================

function spawnHydroPump(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];
  const jetAngle = Math.random() * Math.PI * 2;

  // High-pressure water jet — longer, more particles
  for (let i = 0; i < 60; i++) {
    const dist = rng(0, 120);
    const spread = rng(-10, 10);
    const cx = x + Math.cos(jetAngle) * dist + Math.cos(jetAngle + Math.PI / 2) * spread;
    const cy = y + Math.sin(jetAngle) * dist + Math.sin(jetAngle + Math.PI / 2) * spread;
    ps.push({
      x: cx, y: cy,
      vx: Math.cos(jetAngle) * rng(1, 5),
      vy: Math.sin(jetAngle) * rng(1, 5),
      life: rng(15, 35), maxLife: 40,
      color: randColor("#4169E1", "#1E90FF", "#87CEEB", "#FFF"),
      size: rng(2, 5),
      shape: "streak",
    });
  }

  // Mist spray at edges
  for (let i = 0; i < 20; i++) {
    ps.push({
      x: x + rng(-20, 20), y: y + rng(-20, 20),
      vx: rng(-1, 1), vy: rng(-1.5, 0.5),
      life: rng(15, 30), maxLife: 35,
      color: "#B0E0FF",
      size: rng(1, 3),
      shape: "circle",
    });
  }

  return ps;
}

function spawnSurf(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];
  const waveDir = Math.random() > 0.5 ? 1 : -1;

  // Curling wave arc
  for (let i = 0; i < 50; i++) {
    const t = i / 50;
    const cx = x + waveDir * t * 80;
    const waveHeight = Math.sin(t * Math.PI) * 50;
    const cy = y - waveHeight + t * 10;
    ps.push({
      x: cx, y: cy,
      vx: waveDir * rng(0.5, 2),
      vy: -rng(0, 2),
      life: rng(20, 40), maxLife: 50,
      color: randColor("#4169E1", "#1E90FF", "#87CEEB"),
      size: rng(2, 5),
      shape: "circle",
    });
  }

  // White foam crest
  for (let i = 0; i < 18; i++) {
    const t = 0.4 + rng(0, 0.4);
    const cx = x + waveDir * t * 80;
    const cy = y - Math.sin(t * Math.PI) * 50 + t * 10 + rng(-5, 5);
    ps.push({
      x: cx, y: cy,
      vx: waveDir * rng(0.3, 1), vy: -rng(0.5, 1.5),
      life: rng(10, 20), maxLife: 25,
      color: "#FFF",
      size: rng(1, 3),
      shape: "circle",
    });
  }

  return ps;
}

function spawnAquaTail(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];
  const swingDir = Math.random() > 0.5 ? 1 : -1;

  // Arcing water swipe
  for (let i = 0; i < 40; i++) {
    const t = i / 40;
    const a = -Math.PI / 2 + swingDir * t * Math.PI * 1.2;
    const r = 20 + t * 50;
    const cx = x + Math.cos(a) * r;
    const cy = y + Math.sin(a) * r;
    ps.push({
      x: cx, y: cy,
      vx: swingDir * rng(0.5, 3),
      vy: rng(-2, 1),
      life: rng(15, 30), maxLife: 35,
      color: randColor("#4169E1", "#1E90FF", "#87CEEB"),
      size: rng(2, 4.5),
      shape: "circle",
    });
  }

  // Splash impact at end
  const endAngle = -Math.PI / 2 + swingDir * Math.PI * 1.2;
  const endX = x + Math.cos(endAngle) * 70;
  const endY = y + Math.sin(endAngle) * 70;
  for (let i = 0; i < 18; i++) {
    const a = endAngle + rng(-0.8, 0.8);
    const spd = rng(2, 6);
    ps.push({
      x: endX, y: endY,
      vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
      life: rng(10, 20), maxLife: 25,
      color: randColor("#4169E1", "#87CEEB", "#FFF"),
      size: rng(1.5, 3.5),
      shape: "circle",
    });
  }

  return ps;
}

// ============================================================================
// BULBASAUR — Grass
// ============================================================================

function spawnVineWhip(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];
  const whipDir = Math.random() > 0.5 ? 1 : -1;

  // Two extending vine tendrils
  for (let v = 0; v < 2; v++) {
    const baseAngle = -Math.PI / 4 + v * Math.PI / 2 + whipDir * rng(0, 0.3);
    let cx = x;
    let cy = y;
    let dist = 0;
    const maxDist = 70 + rng(0, 30);
    while (dist < maxDist) {
      const segLen = rng(6, 14);
      const a = baseAngle + Math.sin(dist * 0.08) * rng(0.3, 0.7);
      cx += Math.cos(a) * segLen;
      cy += Math.sin(a) * segLen;
      dist += segLen;
      ps.push({
        x: cx, y: cy,
        vx: rng(-0.3, 0.3), vy: rng(-0.3, 0.3),
        life: rng(10, 20), maxLife: 25,
        color: randColor("#228B22", "#32CD32", "#006400"),
        size: rng(1.5, 3),
        shape: "streak",
      });
    }

    // Leaf cluster at tip
    for (let l = 0; l < 6; l++) {
      const la = Math.random() * Math.PI * 2;
      const lspd = rng(1, 3);
      ps.push({
        x: cx, y: cy,
        vx: Math.cos(la) * lspd, vy: Math.sin(la) * lspd - 1,
        life: rng(15, 30), maxLife: 35,
        color: randColor("#32CD32", "#7CFC00"),
        size: rng(2, 4),
        shape: "leaf",
        va: rng(0.04, 0.08),
        angle: Math.random() * Math.PI * 2,
      });
    }
  }

  return ps;
}

function spawnRazorLeaf(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];
  const baseAngle = Math.random() * Math.PI * 2;

  // Sharp spinning leaves shooting outward
  for (let i = 0; i < 35; i++) {
    const a = baseAngle + (i / 35) * Math.PI * 2;
    const spd = rng(2, 6);
    ps.push({
      x, y,
      vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 1,
      life: rng(30, 50), maxLife: 60,
      color: randColor("#228B22", "#32CD32", "#7CFC00", "#006400"),
      size: rng(3, 6),
      shape: "leaf",
      va: rng(0.05, 0.12) * (Math.random() > 0.5 ? 1 : -1),
      angle: a + Math.PI / 2,
    });
  }

  // Green streak trails
  for (let i = 0; i < 12; i++) {
    const a = baseAngle + rng(0, Math.PI * 2);
    const spd = rng(3, 7);
    ps.push({
      x, y,
      vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
      life: rng(8, 16), maxLife: 18,
      color: "#ADFF2F",
      size: rng(1, 2),
      shape: "streak",
    });
  }

  return ps;
}

function spawnSolarBeam(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];
  const beamAngle = Math.random() * Math.PI * 2;

  // Charging glow at source
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = rng(3, 25);
    ps.push({
      x: x + Math.cos(a) * r, y: y + Math.sin(a) * r,
      vx: Math.cos(a) * rng(0.3, 1.5),
      vy: Math.sin(a) * rng(0.3, 1.5),
      life: rng(10, 20), maxLife: 22,
      color: randColor("#FFF", "#FAFAFA", "#ADFF2F"),
      size: rng(1, 3),
      shape: "circle",
    });
  }

  // Concentrated beam — longer, more particles
  for (let i = 0; i < 55; i++) {
    const dist = rng(5, 130);
    const spread = rng(-8, 8);
    const cx = x + Math.cos(beamAngle) * dist + Math.cos(beamAngle + Math.PI / 2) * spread;
    const cy = y + Math.sin(beamAngle) * dist + Math.sin(beamAngle + Math.PI / 2) * spread;
    ps.push({
      x: cx, y: cy,
      vx: Math.cos(beamAngle) * rng(0.5, 2.5),
      vy: Math.sin(beamAngle) * rng(0.5, 2.5),
      life: rng(15, 35), maxLife: 40,
      color: randColor("#FFF", "#FAFAFA", "#7CFC00", "#ADFF2F"),
      size: rng(1.5, 4),
      shape: "streak",
    });
  }

  // Light ring at source
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2;
    ps.push({
      x, y,
      vx: Math.cos(a) * rng(1, 3),
      vy: Math.sin(a) * rng(1, 3),
      life: rng(15, 25), maxLife: 28,
      color: "#FFF",
      size: rng(1.5, 3),
      shape: "circle",
    });
  }

  return ps;
}

// ============================================================================
// PIPLUP — Water (different moves from Squirtle)
// ============================================================================

function spawnBubbleBeam(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];
  const streamAngle = Math.random() * Math.PI * 2;

  // Stream of bubbles — wider, more particles, longer life
  for (let i = 0; i < 55; i++) {
    const a = streamAngle + rng(-0.7, 0.7);
    const spd = rng(1, 5);
    const size = rng(2, 8);
    ps.push({
      x: x + rng(-10, 10), y: y + rng(-5, 5),
      vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - rng(0.3, 1.5),
      life: rng(40, 75), maxLife: 85,
      color: randColor("#87CEEB", "#B0E0FF", "#E0F0FF"),
      size,
      shape: "circle",
    });
  }

  // Small pop droplets
  for (let i = 0; i < 18; i++) {
    ps.push({
      x: x + rng(-20, 20), y: y + rng(-20, 20),
      vx: rng(-0.5, 0.5), vy: rng(-0.5, 0.5),
      life: rng(5, 15), maxLife: 18,
      color: "#FFF",
      size: rng(0.5, 1.5),
      shape: "circle",
    });
  }

  return ps;
}

function spawnWhirlpool(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];

  // Spinning water vortex
  for (let i = 0; i < 50; i++) {
    const t = i / 50;
    const a = t * Math.PI * 4;
    const r = 5 + t * 45;
    ps.push({
      x: x + Math.cos(a) * r,
      y: y + Math.sin(a) * r - t * 20,
      vx: Math.cos(a + Math.PI / 2) * rng(1, 3),
      vy: Math.sin(a + Math.PI / 2) * rng(1, 3) - t * 2,
      life: rng(25, 50), maxLife: 60,
      color: t > 0.6 ? "#87CEEB" : "#4169E1",
      size: rng(1.5, 3.5) * (1 - t * 0.6),
      shape: "circle",
    });
  }

  // Center suction particles
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = rng(5, 25);
    ps.push({
      x: x + Math.cos(a) * r, y: y + Math.sin(a) * r,
      vx: -Math.cos(a) * rng(0.5, 1.5),
      vy: -Math.sin(a) * rng(0.5, 1.5) - rng(0.5, 1),
      life: rng(15, 30), maxLife: 35,
      color: "#FFF",
      size: rng(1, 2),
      shape: "circle",
    });
  }

  return ps;
}

function spawnAquaJet(x: number, y: number, _color: string): Particle[] {
  const ps: Particle[] = [];
  const jetAngle = Math.random() * Math.PI * 2;

  // Fast water streak trail — longer, more particles
  for (let i = 0; i < 50; i++) {
    const dist = rng(10, 100);
    const spread = rng(-15, 15);
    ps.push({
      x: x + Math.cos(jetAngle) * dist + Math.cos(jetAngle + Math.PI / 2) * spread,
      y: y + Math.sin(jetAngle) * dist + Math.sin(jetAngle + Math.PI / 2) * spread,
      vx: Math.cos(jetAngle) * rng(2, 7),
      vy: Math.sin(jetAngle) * rng(2, 7),
      life: rng(12, 28), maxLife: 32,
      color: randColor("#4169E1", "#1E90FF", "#87CEEB", "#FFF"),
      size: rng(1.5, 3.5),
      shape: "streak",
    });
  }

  // Water envelopment burst at origin
  for (let i = 0; i < 25; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = rng(2, 7);
    ps.push({
      x, y,
      vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
      life: rng(15, 28), maxLife: 32,
      color: randColor("#1E90FF", "#87CEEB"),
      size: rng(2, 4),
      shape: "circle",
    });
  }

  return ps;
}

// ---- Move → spawner dispatch -----------------------------------------------

type SpawnerFn = (x: number, y: number, color: string) => Particle[];

const MOVE_SPAWNERS: Record<string, SpawnerFn> = {
  // Pikachu
  thunderbolt: spawnThunderbolt,
  "volt tackle": spawnVoltTackle,
  "electro ball": spawnElectroBall,
  // Charmander
  flamethrower: spawnFlamethrower,
  "fire spin": spawnFireSpin,
  ember: spawnEmber,
  // Squirtle
  "hydro pump": spawnHydroPump,
  surf: spawnSurf,
  "aqua tail": spawnAquaTail,
  // Bulbasaur
  "vine whip": spawnVineWhip,
  "razor leaf": spawnRazorLeaf,
  "solar beam": spawnSolarBeam,
  // Piplup
  "bubble beam": spawnBubbleBeam,
  whirlpool: spawnWhirlpool,
  "aqua jet": spawnAquaJet,
};

// Type-based fallbacks for unknown moves
const TYPE_FALLBACKS: Record<string, SpawnerFn> = {
  electric: spawnThunderbolt,
  fire: spawnFlamethrower,
  water: spawnHydroPump,
  grass: spawnRazorLeaf,
};

// ---- Component --------------------------------------------------------------

export interface MoveFxHandle {
  trigger: (x: number, y: number, pokemonName: string) => void;
}

export default forwardRef<MoveFxHandle>(function MoveFx(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const bubblesRef = useRef<TextBubble[]>([]);
  const cooldownsRef = useRef<Map<string, number>>(new Map());
  const rafRef = useRef(0);
  const poolsRef = useRef<Map<string, MovePool>>(new Map());
  const mountedRef = useRef(true);

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

      if (p.va && p.angle !== undefined) {
        p.angle += p.va;
      }

      p.vy += 0.05; // gravity
      p.life--;

      if (p.life <= 0) {
        ps.splice(i, 1);
        continue;
      }

      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;

      if (p.shape === "bolt") {
        const boltLen = p.boltLen ?? 10;
        const boltAngle = p.boltAngle ?? 0;
        const ex = p.x + Math.cos(boltAngle) * boltLen * alpha;
        const ey = p.y + Math.sin(boltAngle) * boltLen * alpha;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * alpha;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      } else if (p.shape === "leaf") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle ?? 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const lw = p.size * 2.5 * alpha;
        const lh = p.size * 1.2 * alpha;
        ctx.ellipse(0, 0, lw, lh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-lw, 0);
        ctx.lineTo(lw, 0);
        ctx.stroke();
        ctx.restore();
      } else if (p.shape === "streak") {
        // Line in direction of velocity
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 1;
        const nx = p.vx / spd;
        const ny = p.vy / spd;
        const streakLen = p.size * 3 * alpha;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.8 * alpha;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x - nx * streakLen, p.y - ny * streakLen);
        ctx.lineTo(p.x + nx * streakLen, p.y + ny * streakLen);
        ctx.stroke();
      } else {
        // Circle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.5 + 0.5 * alpha), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Text bubbles
    ctx.font = "bold 15px var(--font-mono, monospace)";
    ctx.textAlign = "center";
    const bs = bubblesRef.current;
    for (let i = bs.length - 1; i >= 0; i--) {
      const b = bs[i];
      b.yOffset -= 0.6;
      b.alpha -= 0.012;

      if (b.alpha <= 0) {
        bs.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = b.alpha;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillText(b.text, b.x + 1, b.yOffset + 1);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.strokeText(b.text, b.x, b.yOffset);
      ctx.fillStyle = "#FFF";
      ctx.fillText(b.text, b.x, b.yOffset);
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
    (x: number, y: number, pokemonName: string) => {
      const key = pokemonName.toLowerCase();
      const now = performance.now();

      const cdUntil = cooldownsRef.current.get(key);
      if (cdUntil && now < cdUntil) return;
      cooldownsRef.current.set(key, now + 800);

      let pool = poolsRef.current.get(key) ?? null;
      if (!pool) {
        pool = getPool(pokemonName);
        poolsRef.current.set(key, pool);
      }

      const moveName = pickRandomMove(pool);
      const color = getTypeColor(pool.primaryType);

      // Per-move spawner with type fallback
      const moveKey = moveName.toLowerCase();
      const spawner =
        MOVE_SPAWNERS[moveKey] ??
        TYPE_FALLBACKS[pool.primaryType] ??
        ((_x, _y, c) => {
          // Generic radial burst
          const ps: Particle[] = [];
          for (let i = 0; i < 25; i++) {
            const a = Math.random() * Math.PI * 2;
            const spd = 1.5 + Math.random() * 3.5;
            ps.push({
              x: _x, y: _y,
              vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 1,
              life: 25 + Math.random() * 25, maxLife: 50,
              color: c, size: 2 + Math.random() * 3,
              shape: "circle",
            });
          }
          return ps;
        });

      const newParticles = spawner(x, y, color);
      particlesRef.current.push(...newParticles);

      bubblesRef.current.push({
        text: `${pokemonName} used ${moveName}!`,
        alpha: 1,
        x,
        yOffset: y - 50,
      });

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
      mountedRef.current = false;
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
