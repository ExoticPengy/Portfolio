"use client";

import { useSyncExternalStore } from "react";
import { ACHIEVEMENTS, EMPTY, load, unlock as unlockPure, visit as visitPure, type AchId, type AchState, type Result } from "@/lib/achievements";

const KEY = "portfolio.achievements";
export type Toast = { id: number; text: string; jingle: boolean };

// ponytail: module-level store, one per tab, shared without a provider.
let state: AchState = EMPTY;
let toasts: Toast[] = [];
let loaded = false;
let seq = 0; // toast ids: the toast slot is keyed on them so each one restarts its fade
const NONE: Toast[] = [];
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { state = load(localStorage.getItem(KEY)); } catch { /* storage off: start empty */ }
}

function apply(r: Result) {
  if (r.state === state) return;
  state = r.state;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  const name = (id: AchId) => ACHIEVEMENTS.find((a) => a.id === id)?.name ?? id;
  toasts = [...toasts, ...r.fresh.map((id) => ({ id: ++seq, text: `★ ACHIEVEMENT · ${name(id)}`, jingle: true }))];
  emit();
}

export const unlock = (id: AchId) => { ensureLoaded(); apply(unlockPure(state, id)); };
export const visit = (section: string) => { ensureLoaded(); apply(visitPure(state, section)); };
export const notify = (text: string) => { toasts = [...toasts, { id: ++seq, text, jingle: false }]; emit(); };
export const nextToast = () => { toasts = toasts.slice(1); emit(); };
export const resetAchievements = () => {
  state = EMPTY;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  emit();
};

export const getToasts = () => toasts;

const subscribe = (f: () => void) => {
  ensureLoaded();
  subs.add(f);
  return () => { subs.delete(f); };
};

export function useAchievements() {
  const s = useSyncExternalStore(subscribe, () => state, () => EMPTY);
  const t = useSyncExternalStore(subscribe, getToasts, () => NONE);
  return { state: s, toast: t[0] ?? null };
}
