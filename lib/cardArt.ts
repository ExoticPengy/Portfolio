// Pure helpers for the menu card art. No DOM, so it runs under vitest's node env.

export const COVER_MS = 5000; // time each Projects cover stays up

export function nextIndex(i: number, n: number): number {
  return n > 1 ? (i + 1) % n : 0;
}

// Highest-rated skill names. Array sort is stable, so ties keep list order.
export function topSkills(cats: { items: [string, number][] }[], n = 9): string[] {
  return cats.flatMap((c) => c.items).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name]) => name);
}
