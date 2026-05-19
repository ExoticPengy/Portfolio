import { describe, it, expect } from "vitest";
import {
  getTypeColor,
  getPool,
  pickRandomMove,
} from "@/lib/moves";

describe("getTypeColor", () => {
  it("returns correct color for known type", () => {
    expect(getTypeColor("fire")).toBe("#FF4500");
    expect(getTypeColor("water")).toBe("#4169E1");
    expect(getTypeColor("electric")).toBe("#FFD700");
  });

  it("returns normal color for unknown type", () => {
    expect(getTypeColor("unknown-type")).toBe("#C8C8C8");
  });
});

describe("getPool", () => {
  it("returns iconic pool for pikachu", () => {
    const pool = getPool("Pikachu");
    expect(pool.primaryType).toBe("electric");
    expect(pool.moves).toContain("Thunderbolt");
    expect(pool.moves).toContain("Volt Tackle");
  });

  it("returns iconic pool for bulbasaur", () => {
    const pool = getPool("bulbasaur");
    expect(pool.primaryType).toBe("grass");
    expect(pool.moves).toContain("Razor Leaf");
    expect(pool.moves).toContain("Solar Beam");
  });

  it("returns all moves as iconic (no generic filler)", () => {
    const pool = getPool("charmander");
    expect(pool.moves).not.toContain("Tackle");
    expect(pool.moves).not.toContain("Growl");
  });

  it("returns generic pool for unknown pokemon", () => {
    const pool = getPool("MissingNo");
    expect(pool.primaryType).toBe("normal");
    expect(pool.moves.length).toBeGreaterThan(0);
  });
});

describe("pickRandomMove", () => {
  it("returns a move from the pool", () => {
    const pool = { moves: ["Tackle", "Growl"], primaryType: "normal" };
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(pickRandomMove(pool));
    }
    expect([...results].every((m) => pool.moves.includes(m))).toBe(true);
  });
});
