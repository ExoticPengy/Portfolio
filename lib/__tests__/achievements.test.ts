import { describe, it, expect } from "vitest";
import { unlock, visit, load, EMPTY, ACHIEVEMENTS, type AchId, type AchState } from "@/lib/achievements";

describe("unlock", () => {
  it("returns fresh once, then nothing with the same state", () => {
    const a = unlock(EMPTY, "deepdive");
    expect(a.fresh).toEqual(["deepdive"]);
    const b = unlock(a.state, "deepdive");
    expect(b.fresh).toEqual([]);
    expect(b.state).toBe(a.state);
  });
  it("ignores unknown ids", () => {
    expect(unlock(EMPTY, "nope" as AchId)).toEqual({ state: EMPTY, fresh: [] });
  });
  it("adds COMPLETIONIST with the 7th", () => {
    let s: AchState = EMPTY;
    let last: AchId[] = [];
    for (const { id } of ACHIEVEMENTS.filter((a) => a.id !== "master")) ({ state: s, fresh: last } = unlock(s, id));
    expect(last).toEqual(["hello", "master"]);
    expect(s.unlocked).toHaveLength(8);
  });
});

describe("visit", () => {
  it("first section unlocks FIRST STEPS", () => {
    expect(visit(EMPTY, "about").fresh).toEqual(["first"]);
  });
  it("4 distinct sections unlock EXPLORER once", () => {
    let s: AchState = EMPTY;
    const fresh: AchId[] = [];
    for (const v of ["about", "about", "projects", "skills", "contact", "contact"]) {
      const r = visit(s, v);
      s = r.state;
      fresh.push(...r.fresh);
    }
    expect(fresh).toEqual(["first", "explorer"]);
  });
  it("ignores non-sections", () => {
    expect(visit(EMPTY, "home")).toEqual({ state: EMPTY, fresh: [] });
  });
});

describe("load", () => {
  it("is empty on null, corrupt or non-object JSON", () => {
    expect(load(null)).toEqual(EMPTY);
    expect(load("{oops")).toEqual(EMPTY);
    expect(load("null")).toEqual(EMPTY);
    expect(load('{"unlocked":5}')).toEqual(EMPTY);
  });
  it("drops unknown ids and sections", () => {
    expect(load(JSON.stringify({ unlocked: ["first", "gone"], visited: ["about", "home"] })))
      .toEqual({ unlocked: ["first"], visited: ["about"] });
  });
});
