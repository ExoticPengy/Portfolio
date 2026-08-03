"use client";
import { useEffect, useState } from "react";
import {
  buildWeeks,
  contribApi,
  eventsApi,
  summarizeEvents,
  type Activity,
  type Contrib,
  type GhEvent,
} from "@/lib/github";

type Heatmap = { total: number } & ReturnType<typeof buildWeeks>;

// ponytail: both endpoints are third-party and unauthenticated, so either can
// fail on its own — each half renders only if its own fetch came back.
const json = <T,>(url: string) =>
  fetch(url).then((r) => (r.ok ? (r.json() as Promise<T>) : Promise.reject(r.status)));

export default function CommitLog({ user }: { user: string }) {
  const [heat, setHeat] = useState<Heatmap | null>(null);
  const [feed, setFeed] = useState<Activity[]>([]);

  useEffect(() => {
    let alive = true;
    json<{ total: { lastYear: number }; contributions: Contrib[] }>(contribApi(user))
      .then((j) => alive && setHeat({ total: j.total.lastYear, ...buildWeeks(j.contributions) }))
      .catch(() => {});
    json<GhEvent[]>(eventsApi(user))
      .then((j) => alive && setFeed(summarizeEvents(j)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [user]);

  if (!heat?.weeks.length && !feed.length) return null;
  const cols = { "--cols": heat?.weeks.length } as React.CSSProperties;

  return (
    <section className="commit-log reveal d3">
      {heat && heat.weeks.length > 0 && (
        <>
          <h2 className="commit-log-title">COMMIT LOG</h2>
          <div className="commit-log-scroll">
            <div className="commit-log-months" style={cols}>
              {heat.monthLabels.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
            <div
              className="commit-log-grid"
              style={cols}
              role="img"
              aria-label={`${heat.total} GitHub contributions in the last year`}
            >
              {heat.weeks.flat().map((d, i) =>
                d ? (
                  <i
                    key={i}
                    data-level={d.level}
                    title={`${d.count} contribution${d.count === 1 ? "" : "s"} on ${d.date}`}
                  />
                ) : (
                  <i key={i} className="empty" />
                ),
              )}
            </div>
          </div>
          <div className="commit-log-foot">
            <span>
              <b>{heat.total}</b> CONTRIBUTIONS · LAST 12 MONTHS
            </span>
            <span className="commit-log-legend">
              LESS
              {[0, 1, 2, 3, 4].map((l) => (
                <i key={l} data-level={l} />
              ))}
              MORE
            </span>
          </div>
        </>
      )}

      {feed.length > 0 && (
        <>
          <h2 className="commit-log-title activity-log-title">ACTIVITY LOG</h2>
          <ol className="activity-log">
            {feed.map((a) => (
              <li key={a.id}>
                <a href={`https://github.com/${a.repo}`} target="_blank" rel="noopener noreferrer">
                  <span className="date">{a.date}</span>
                  <span className="verb">{a.verb}</span>
                  <span className="repo">{a.repo}</span>
                  {a.detail && <span className="detail">{a.detail}</span>}
                </a>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
