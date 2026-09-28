import { describe, it, expect } from "vitest";
import { nextIndex, topSkills, COVER_MS } from "@/lib/cardArt";

describe("COVER_MS", () => {
  it("holds each cover for 5s", () => {
    expect(COVER_MS).toBe(5000);
  });
});

describe("nextIndex", () => {
  it("advances and wraps", () => {
    expect(nextIndex(0, 3)).toBe(1);
    expect(nextIndex(2, 3)).toBe(0);
  });
  it("is 0 for empty or single lists", () => {
    expect(nextIndex(0, 0)).toBe(0);
    expect(nextIndex(0, 1)).toBe(0);
  });
});

describe("topSkills", () => {
  it("picks highest ratings, ties in list order", () => {
    const cats = [
      { items: [["A", 80], ["B", 90]] as [string, number][] },
      { items: [["C", 90], ["D", 70], ["E", 85]] as [string, number][] },
    ];
    expect(topSkills(cats, 3)).toEqual(["B", "C", "E"]);
  });
  it("defaults to 9", () => {
    const items = Array.from({ length: 12 }, (_, i) => [`S${i}`, 50] as [string, number]);
    expect(topSkills([{ items }])).toHaveLength(9);
  });
});
