import { useSyncExternalStore } from "react";

/**
 * Browsers allow roughly 5 million characters per site in localStorage (less on
 * some mobile browsers). We warn well before that so staff can export and archive.
 */
export const STORAGE_BUDGET_CHARS = 5_000_000;
export const WARN_AT = 0.8;

export type StorageHealth = { ok: boolean; chars: number; error?: string };

let health: StorageHealth = { ok: true, chars: 0 };
const listeners = new Set<() => void>();

export function reportSave(next: StorageHealth) {
  if (next.ok === health.ok && next.chars === health.chars && next.error === health.error) return;
  health = next;
  listeners.forEach((l) => l());
}

export const usageRatio = (h: StorageHealth) => h.chars / STORAGE_BUDGET_CHARS;

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const SERVER: StorageHealth = { ok: true, chars: 0 };

export const useStorageHealth = () => useSyncExternalStore(subscribe, () => health, () => SERVER);
