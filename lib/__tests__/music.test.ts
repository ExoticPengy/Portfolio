import { it, expect } from "vitest";
import { SCALE, walk } from "@/lib/music";

const seeded = (s: number) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;

it("walks the scale in small steps and stays inside it", () => {
  const rand = seeded(7);
  let i = 0;
  for (let n = 0; n < 1000; n++) {
    const j = walk(i, rand);
    expect(j).toBeGreaterThanOrEqual(0);
    expect(j).toBeLessThan(SCALE.length);
    expect(Math.abs(j - i)).toBeLessThanOrEqual(2);
    i = j;
  }
});

it("does not repeat the same phrase", () => {
  const rand = seeded(42);
  const phrase = (start: number) => {
    const out = [start];
    for (let n = 1; n < 32; n++) out.push(walk(out[n - 1], rand));
    return out;
  };
  expect(phrase(4)).not.toEqual(phrase(4));
});
