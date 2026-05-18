import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTypeColor,
  getFallbackPool,
  pickRandomMove,
  fetchMovePool,
  clearMoveCache,
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

describe("getFallbackPool", () => {
  it("returns hardcoded pool for pikachu", () => {
    const pool = getFallbackPool("Pikachu");
    expect(pool.primaryType).toBe("electric");
    expect(pool.moves).toContain("Thunderbolt");
  });

  it("returns generic pool for unknown pokemon", () => {
    const pool = getFallbackPool("MissingNo");
    expect(pool.primaryType).toBe("normal");
    expect(pool.moves.length).toBeGreaterThan(0);
  });
});

describe("pickRandomMove", () => {
  it("returns a move from the pool", () => {
    const pool = { moves: ["Tackle", "Growl"], primaryType: "normal" };
    const results = new Set<string>();
    // Run many times to confirm it picks from the pool
    for (let i = 0; i < 50; i++) {
      results.add(pickRandomMove(pool));
    }
    expect([...results].every((m) => pool.moves.includes(m))).toBe(true);
  });
});

describe("fetchMovePool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearMoveCache();
  });

  it("returns cached pool on second call (no re-fetch)", async () => {
    const mockData = {
      types: [{ type: { name: "electric" } }],
      moves: [
        {
          move: { name: "thunder-punch" },
          version_group_details: [
            { level_learned_at: 1, move_learn_method: { name: "level-up" } },
          ],
        },
      ],
    };

    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

    const pool1 = await fetchMovePool("pikachu");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(pool1.moves).toContain("Thunder Punch");

    // Second call should use cache — no fetch
    const pool2 = await fetchMovePool("pikachu");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(pool2).toEqual(pool1);
  });

  it("falls back on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));

    const pool = await fetchMovePool("pikachu");
    expect(pool.primaryType).toBe("electric");
    expect(pool.moves.length).toBeGreaterThan(0);
  });

  it("falls back on non-200 response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Not Found", { status: 404 })
    );

    const pool = await fetchMovePool("unknown-mon");
    expect(pool.primaryType).toBe("normal");
    expect(pool.moves.length).toBeGreaterThan(0);
  });
});
