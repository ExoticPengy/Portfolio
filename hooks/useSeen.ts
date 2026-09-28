"use client";

import { useEffect, type RefObject } from "react";
import { motionOk } from "@/components/PixelCanvas";
import { wildLine } from "@/lib/encounter";

// Marks [data-enc] items in the scroll box with data-seen the first time they are 25% in view.
// data-seen="" pops (CSS); "old" shows without a pop: lite, reduced motion, or a remount of a key
// already seen this visit (back from a project detail). Items seen together make one narrator line:
// their data-wild names merge ("Wild A and B appeared!"), else the first data-line wins. Lines from items
// already in view on arrival are held until the first scroll, so the enter line plays first.
export function useSeen(root: RefObject<HTMLElement | null>, onLine: (text: string) => void) {
  useEffect(() => {
    const r = root.current;
    if (!r) return;
    const keys = new Set<string>();
    let scrolled = false;
    let lines: string[] = [];
    let wild: string[] = [];
    const quiet = !motionOk() || !("IntersectionObserver" in window);

    const mark = (el: HTMLElement) => {
      if (el.dataset.seen !== undefined) return;
      const key = el.dataset.enc ?? "";
      const again = keys.has(key);
      keys.add(key);
      el.dataset.seen = quiet || again ? "old" : "";
      io?.unobserve(el);
      if (quiet || again) return;
      if (el.dataset.wild) wild.push(el.dataset.wild);
      else if (el.dataset.line) lines.push(el.dataset.line);
    };
    const flush = () => {
      if (!scrolled) return;
      const text = wildLine(wild) ?? lines[0];
      lines = [];
      wild = [];
      if (text) onLine(text);
    };
    const io = quiet ? null : new IntersectionObserver(
      (es) => {
        es.forEach((e) => { if (e.isIntersecting) mark(e.target as HTMLElement); });
        flush();
      },
      { root: r, threshold: 0.25 },
    );
    const scan = () => r.querySelectorAll<HTMLElement>("[data-enc]:not([data-seen])").forEach((el) => {
      if (!io || keys.has(el.dataset.enc ?? "")) mark(el);
      else io.observe(el);
    });
    const onScroll = () => {
      scrolled = true;
      flush();
    };
    const onFocus = (e: FocusEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-enc]");
      if (el) { mark(el); flush(); }
    };

    scan();
    const mo = new MutationObserver(scan); // grid remounts when leaving a project detail
    mo.observe(r, { childList: true, subtree: true });
    r.addEventListener("scroll", onScroll, { once: true, passive: true });
    r.addEventListener("focusin", onFocus);
    return () => {
      io?.disconnect();
      mo.disconnect();
      r.removeEventListener("scroll", onScroll);
      r.removeEventListener("focusin", onFocus);
    };
  }, [root, onLine]);
}
