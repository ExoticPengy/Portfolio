import { describe, it, expect } from "vitest";
import {
  sampleCells,
  springStep,
  fitRect,
  coinPoint,
  assignTargets,
  wipeOrder,
  WIPES,
  deResSteps,
  stepped,
  COIN,
  type Cell,
} from "@/lib/pixels";

const px = (width: number, height: number, rgba: number[][]) => ({
  width,
  height,
  data: new Uint8ClampedArray(rgba.flat()),
});

describe("sampleCells", () => {
  const img = px(2, 2, [
    [255, 0, 0, 255], [0, 0, 255, 255],
    [255, 0, 0, 255], [0, 0, 255, 255],
  ]);

  it("averages the colour of each cell", () => {
    const cells = sampleCells(img, 2);
    expect(cells).toHaveLength(1);
    expect(cells[0].c).toBe("rgb(128,0,128)");
  });

  it("makes one cell per pixel at size 1, homed at its position", () => {
    expect(sampleCells(img, 1).map((c) => [c.hx, c.hy])).toEqual([[0, 0], [1, 0], [0, 1], [1, 1]]);
  });

  it("skips transparent cells, and dark cells when minLum is set", () => {
    const img2 = px(2, 1, [[255, 255, 255, 0], [10, 10, 10, 255]]);
    expect(sampleCells(img2, 1)).toHaveLength(1);
    expect(sampleCells(img2, 1, 0.1)).toHaveLength(0);
  });
});

describe("springStep", () => {
  it("settles back home when the pointer is far away", () => {
    const k: Cell = { x: 50, y: 0, hx: 0, hy: 0, vx: 0, vy: 0, c: "" };
    for (let i = 0; i < 300; i++) springStep(k, -1e4, -1e4, 90);
    expect(Math.hypot(k.x - k.hx, k.y - k.hy)).toBeLessThan(0.5);
  });

  it("pushes a resting cell away from a nearby pointer", () => {
    const k: Cell = { x: 0, y: 0, hx: 0, hy: 0, vx: 0, vy: 0, c: "" };
    springStep(k, 10, 0, 90);
    expect(k.x).toBeLessThan(0);
  });
});

describe("fitRect", () => {
  const box = { x: 0, y: 0, w: 200, h: 100 };
  it("contain letterboxes", () => expect(fitRect(100, 100, box, "contain")).toEqual({ x: 50, y: 0, w: 100, h: 100 }));
  it("cover crops", () => expect(fitRect(100, 100, box, "cover")).toEqual({ x: 0, y: -50, w: 200, h: 200 }));
  it("fill stretches", () => expect(fitRect(100, 100, box, "fill")).toEqual(box));
});

describe("coinPoint", () => {
  it("maps the coin through object-fit contain", () => {
    // contain: scale 0.5, so the video draws 944x540, centred vertically at y 230
    const p = coinPoint(1888, 1080, { x: 0, y: 0, w: 944, h: 1000 }, "contain");
    expect(p.x).toBeCloseTo(944 * COIN.x);
    expect(p.y).toBeCloseTo(230 + 540 * COIN.y);
    expect(p.r).toBeCloseTo(944 * COIN.r);
  });
});

describe("assignTargets", () => {
  const rects = [
    { x: 0, y: 0, w: 100, h: 50 },
    { x: 300, y: 300, w: 50, h: 50 },
    { x: 0, y: 0, w: 0, h: 0 },
  ];

  it("returns one point per cell, each strictly inside a non-empty rect", () => {
    const pts = assignTargets(137, rects);
    expect(pts).toHaveLength(137);
    for (const p of pts) {
      const inside = rects.slice(0, 2).some((r) => p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h);
      expect(inside).toBe(true);
    }
  });

  it("returns nothing when there is nowhere to go", () => {
    expect(assignTargets(10, [])).toEqual([]);
    expect(assignTargets(10, [{ x: 0, y: 0, w: 0, h: 10 }])).toEqual([]);
  });
});

describe("wipeOrder", () => {
  for (const p of WIPES) {
    it(`${p}: every cell gets a valid step and every step is used`, () => {
      const { steps, order } = wipeOrder(p, 32, 18);
      expect(order).toHaveLength(32 * 18);
      for (const s of order) {
        expect(Number.isInteger(s)).toBe(true);
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThan(steps);
      }
      expect(new Set(order).size).toBe(steps);
    });
  }

  it("mosaic is repeatable for a given seed", () => {
    expect(wipeOrder("mosaic", 8, 4, 3)).toEqual(wipeOrder("mosaic", 8, 4, 3));
  });
});

describe("stepped", () => {
  it("shows the first frame at t=0 and finishes at t=1", () => {
    expect(stepped(0, 8)).toBe(1 / 8);
    expect(stepped(0.5, 8)).toBe(5 / 8);
    expect(stepped(1, 8)).toBe(1);
  });
});

describe("deResSteps", () => {
  it("goes from coarse to sharp", () => {
    const s = deResSteps();
    expect(s[0]).toBeGreaterThan(s[1]);
    expect(s[s.length - 1]).toBe(1);
  });
});
