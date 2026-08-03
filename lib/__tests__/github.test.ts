import { describe, it, expect } from "vitest";
import { buildWeeks, summarizeEvents, type Contrib, type GhEvent } from "@/lib/github";

const day = (date: string): Contrib => ({ date, count: 0, level: 0 });

// 2025-08-03 is a Sunday, 2026-01-01 a Thursday.
const range = (start: string, n: number): Contrib[] => {
  const t0 = Date.parse(`${start}T00:00:00Z`);
  return Array.from({ length: n }, (_, i) =>
    day(new Date(t0 + i * 86400000).toISOString().slice(0, 10)),
  );
};

describe("buildWeeks", () => {
  it("returns empty for no data", () => {
    expect(buildWeeks([])).toEqual({ weeks: [], monthLabels: [] });
  });

  it("pads the first week so the start date lands on its weekday row", () => {
    // 2025-08-06 is a Wednesday → 3 leading nulls (Sun, Mon, Tue).
    const { weeks } = buildWeeks(range("2025-08-06", 10));
    expect(weeks[0].slice(0, 3)).toEqual([null, null, null]);
    expect(weeks[0][3]?.date).toBe("2025-08-06");
  });

  it("pads the last week and keeps every column 7 tall", () => {
    const { weeks } = buildWeeks(range("2025-08-03", 10));
    expect(weeks).toHaveLength(2);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks[1].slice(3)).toEqual([null, null, null, null]);
  });

  it("labels a month once, on its first week", () => {
    const { weeks, monthLabels } = buildWeeks(range("2025-08-03", 365));
    expect(monthLabels).toHaveLength(weeks.length);
    expect(monthLabels[0]).toBe("AUG");
    expect(monthLabels.filter((m) => m === "SEP")).toHaveLength(1);
    expect(monthLabels.filter(Boolean)).toHaveLength(13); // 12 months + wrap back to AUG
  });
});

let n = 0;
const ev = (type: string, created_at: string, repo: string, payload: GhEvent["payload"] = {}): GhEvent =>
  ({ id: String(++n), type, created_at, repo: { name: repo }, payload });

const push = (at: string, repo: string, ref = "refs/heads/main") =>
  ev("PushEvent", at, repo, { ref });

describe("summarizeEvents", () => {
  it("collapses same-day pushes to the same branch into one counted row", () => {
    const rows = summarizeEvents([
      push("2026-07-15T09:24:14Z", "me/portfolio"),
      push("2026-07-15T09:10:58Z", "me/portfolio"),
      push("2026-07-15T08:27:00Z", "me/portfolio"),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ date: "JUL 15", verb: "PUSHED ×3", repo: "me/portfolio", detail: "main" });
  });

  it("keeps pushes apart across days, branches, and repos", () => {
    const rows = summarizeEvents([
      push("2026-07-15T09:00:00Z", "me/a"),
      push("2026-07-14T09:00:00Z", "me/a"),                          // different day
      push("2026-07-15T09:00:00Z", "me/a", "refs/heads/dev"),        // different branch
      push("2026-07-15T09:00:00Z", "me/b"),                          // different repo
    ]);
    expect(rows).toHaveLength(4);
    expect(rows.every((r) => r.verb === "PUSHED")).toBe(true);
  });

  it("labels non-push events and drops types it has no wording for", () => {
    const rows = summarizeEvents([
      ev("PullRequestEvent", "2026-07-20T09:07:58Z", "org/app", { action: "merged", number: 143 }),
      ev("CreateEvent", "2026-07-16T06:39:27Z", "org/app", { ref: "Brief-Sharing", ref_type: "branch" }),
      ev("ForkEvent", "2026-07-10T00:00:00Z", "org/app"),
      ev("MemberEvent", "2026-07-09T00:00:00Z", "org/app"),
    ]);
    expect(rows.map((r) => r.verb)).toEqual(["PR #143 MERGED", "NEW BRANCH", "FORKED"]);
    expect(rows[1].detail).toBe("Brief-Sharing");
  });

  it("caps the list at the limit", () => {
    const many = Array.from({ length: 25 }, (_, i) =>
      ev("WatchEvent", `2026-07-${String(i + 1).padStart(2, "0")}T00:00:00Z`, `me/r${i}`),
    );
    expect(summarizeEvents(many, 8)).toHaveLength(8);
  });
});
