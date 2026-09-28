// Pure achievement logic. No DOM, so it runs under vitest's node env.

export const ACHIEVEMENTS = [
  { id: "first", name: "FIRST STEPS", hint: "Enter any section" },
  { id: "explorer", name: "EXPLORER", hint: "Visit all 4 sections" },
  { id: "deepdive", name: "DEEP DIVE", hint: "Open a project" },
  { id: "source", name: "SOURCE READER", hint: "Open a repo or live link" },
  { id: "catch", name: "GOTTA CATCH 'EM", hint: "Click a Pokémon" },
  { id: "shiny", name: "SHINY HUNTER", hint: "↑↑↓↓←→←→BA" },
  { id: "hello", name: "SAY HI", hint: "Click a contact link" },
  { id: "master", name: "COMPLETIONIST", hint: "Unlock the other 7" },
] as const;

export type AchId = (typeof ACHIEVEMENTS)[number]["id"];
export type AchState = { unlocked: AchId[]; visited: string[] };
export type Result = { state: AchState; fresh: AchId[] };

export const EMPTY: AchState = { unlocked: [], visited: [] };
const SECTIONS = ["about", "projects", "skills", "contact"];
const IDS: readonly string[] = ACHIEVEMENTS.map((a) => a.id);

// No-ops return the same state object, so the store can skip saving and re-rendering.
export function unlock(s: AchState, id: AchId): Result {
  if (!IDS.includes(id) || s.unlocked.includes(id)) return { state: s, fresh: [] };
  const unlocked: AchId[] = [...s.unlocked, id];
  const fresh: AchId[] = [id];
  if (!unlocked.includes("master") && unlocked.length === IDS.length - 1) {
    unlocked.push("master");
    fresh.push("master");
  }
  return { state: { ...s, unlocked }, fresh };
}

export function visit(s: AchState, section: string): Result {
  if (!SECTIONS.includes(section) || s.visited.includes(section)) return { state: s, fresh: [] };
  const a = unlock({ ...s, visited: [...s.visited, section] }, "first");
  if (a.state.visited.length < SECTIONS.length) return a;
  const b = unlock(a.state, "explorer");
  return { state: b.state, fresh: [...a.fresh, ...b.fresh] };
}

// Stored progress may be corrupt or from an older id list: keep only what is still valid.
export function load(raw: string | null): AchState {
  try {
    const p = JSON.parse(raw ?? "") as Partial<AchState>;
    return {
      unlocked: (p.unlocked ?? []).filter((id): id is AchId => IDS.includes(id)),
      visited: (p.visited ?? []).filter((v) => SECTIONS.includes(v)),
    };
  } catch {
    return EMPTY;
  }
}
