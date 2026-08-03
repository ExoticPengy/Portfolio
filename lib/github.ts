/** GitHub contribution heatmap + activity feed — public endpoints, no API key. */

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export type Contrib = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

export const contribApi = (user: string) =>
  `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=last`;

export const eventsApi = (user: string) =>
  `https://api.github.com/users/${encodeURIComponent(user)}/events/public?per_page=100`;

/**
 * Bucket a chronological day list into calendar weeks (Sun→Sat), padding the
 * first and last week with nulls so every column has 7 slots. `monthLabels[i]`
 * is the month name to print above week `i`, or "" when it repeats the previous.
 */
export function buildWeeks(days: Contrib[]) {
  const weeks: (Contrib | null)[][] = [];
  const monthLabels: string[] = [];
  if (!days.length) return { weeks, monthLabels };

  // Parse as UTC — "2025-08-03" in a negative-offset zone would otherwise land
  // on the previous day and shift the whole grid by one row.
  const dayOfWeek = (d: string) => new Date(`${d}T00:00:00Z`).getUTCDay();
  const month = (d: string) => new Date(`${d}T00:00:00Z`).getUTCMonth();

  let week: (Contrib | null)[] = Array(dayOfWeek(days[0].date)).fill(null);
  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push([...week, ...Array(7 - week.length).fill(null)]);

  let last = -1;
  for (const w of weeks) {
    const first = w.find(Boolean);
    const m = first ? month(first.date) : last;
    // ponytail: label the first week of each month, and never twice in a row
    monthLabels.push(m !== last ? MONTHS[m] : "");
    last = m;
  }
  return { weeks, monthLabels };
}

/** One entry of the public events feed, trimmed to what we render. */
export type GhEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    ref?: string | null;
    ref_type?: string;
    action?: string;
    number?: number;
    pull_request?: { number?: number };
    issue?: { number?: number };
    release?: { tag_name?: string };
  };
};

export type Activity = { id: string; date: string; verb: string; repo: string; detail: string };

const branch = (ref?: string | null) => (ref ?? "").replace(/^refs\/heads\//, "");

/** "2026-07-16T06:39:27Z" → "JUL 16" */
function stamp(iso: string) {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}`;
}

function describe(e: GhEvent): { verb: string; detail: string } | null {
  const p = e.payload;
  const num = p.number ?? p.pull_request?.number ?? p.issue?.number;
  switch (e.type) {
    case "PushEvent":
      return { verb: "PUSHED", detail: branch(p.ref) };
    case "PullRequestEvent":
      return { verb: `PR #${num} ${(p.action ?? "").toUpperCase()}`, detail: "" };
    case "IssuesEvent":
      return { verb: `ISSUE #${num} ${(p.action ?? "").toUpperCase()}`, detail: "" };
    case "PullRequestReviewEvent":
      return { verb: `REVIEWED PR #${num}`, detail: "" };
    case "IssueCommentEvent":
      return { verb: `COMMENTED #${num}`, detail: "" };
    case "CreateEvent":
      return p.ref_type === "repository"
        ? { verb: "NEW REPO", detail: "" }
        : { verb: `NEW ${(p.ref_type ?? "REF").toUpperCase()}`, detail: p.ref ?? "" };
    case "DeleteEvent":
      return { verb: `DELETED ${(p.ref_type ?? "REF").toUpperCase()}`, detail: p.ref ?? "" };
    case "ReleaseEvent":
      return { verb: "RELEASED", detail: p.release?.tag_name ?? "" };
    case "ForkEvent":
      return { verb: "FORKED", detail: "" };
    case "WatchEvent":
      return { verb: "STARRED", detail: "" };
    case "PublicEvent":
      return { verb: "WENT PUBLIC", detail: "" };
    // ponytail: bot/webhook noise (member changes, wiki edits) isn't worth a row
    default:
      return null;
  }
}

/**
 * Turn the raw events feed into display rows, newest first. Pushes to the same
 * repo and branch on the same day collapse into one "PUSHED ×N" row — otherwise
 * a single afternoon of work buries everything else in the list.
 */
export function summarizeEvents(events: GhEvent[], limit = 10): Activity[] {
  const rows: (Activity & { pushes: number })[] = [];
  const pushIndex = new Map<string, number>();

  for (const e of events) {
    const d = describe(e);
    if (!d) continue;
    const date = stamp(e.created_at);

    if (e.type === "PushEvent") {
      const key = `${date}|${e.repo.name}|${d.detail}`;
      const at = pushIndex.get(key);
      if (at !== undefined) {
        rows[at].pushes++;
        continue;
      }
      pushIndex.set(key, rows.length);
    }
    rows.push({ id: e.id, date, verb: d.verb, repo: e.repo.name, detail: d.detail, pushes: 1 });
  }

  return rows.slice(0, limit).map(({ pushes, ...r }) => ({
    ...r,
    verb: pushes > 1 ? `${r.verb} ×${pushes}` : r.verb,
  }));
}
