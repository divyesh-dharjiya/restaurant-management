import type { PosState } from "@/types/pos";
import { generateDemoBills } from "@/lib/demo-bills";
import { initialState } from "./slices/posSlice";

export const STORAGE_KEY = "eatinghub:pos:v1";
/** Earlier app versions; data is carried forward from the newest one found. */
const LEGACY_KEYS = ["tabletap:pos:v2", "tabletap:pos:v1"];
const SEED_VERSION = 1;

function readSaved(): Partial<PosState> | null {
  for (const key of [STORAGE_KEY, ...LEGACY_KEYS]) {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  }
  return null;
}

/** Restore state on the client, seeding sample bills the first time. Undefined on the server. */
export function loadState(): PosState | undefined {
  if (typeof window === "undefined") return undefined;
  let state: PosState = initialState;
  try {
    const saved = readSaved();
    if (saved) state = { ...initialState, ...saved };
  } catch {}
  if ((state.seedVersion ?? 0) < SEED_VERSION) {
    const bills = [...state.bills.filter((b) => !b.demo), ...generateDemoBills()].sort((a, b) => b.createdAt - a.createdAt);
    state = { ...state, bills, seedVersion: SEED_VERSION };
  }
  return state;
}

export function saveState(state: PosState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
