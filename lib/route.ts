import type { View } from "./types";

// Hash route: #/projects/timesync -> { view: "projects", slug: "timesync" }
// Hash (not real pages) so deep links work on static hosting without a rewrite,
// and so the arcade transitions keep running inside one DOM tree.

const ROUTED_VIEWS: View[] = ["about", "projects", "skills", "contact"];

export type Route = { view: View; slug: string | null };

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const view = parts[0];
  if (!view || !ROUTED_VIEWS.includes(view as View)) return { view: "home", slug: null };
  return { view: view as View, slug: parts[1] ?? null };
}

export function formatHash(view: View, slug?: string | null): string {
  // "flying" is a transient transition state — never routed.
  if (view === "home" || view === "flying") return "#/";
  return slug ? `#/${view}/${slug}` : `#/${view}`;
}
