import type { Booking, PosState } from "@/types/pos";
import { generateDemoBills } from "@/lib/demo-bills";
import { initialState } from "./slices/posSlice";
import { reportSave } from "./storageHealth";

/**
 * Bills are stored under their own key so the (large, rarely-changing) bill
 * history isn't rewritten every time a dish is added to an order.
 */
export const STATE_KEY = "eatinghub:state:v2";
export const BILLS_KEY = "eatinghub:bills:v2";
/** Every key this app writes; used to react to changes from other tabs. */
export const STORAGE_KEYS = [STATE_KEY, BILLS_KEY];
/** Older single-key saves; data is carried forward from the newest one found. */
const LEGACY_KEYS = ["eatinghub:pos:v1", "tabletap:pos:v2", "tabletap:pos:v1"];
/** v1: 60 sample bills. v2: 1,250 realistic sample bills. */
export const SEED_VERSION = 2;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Older saves stored one booking per table as `{ [tableId]: booking }`. */
function normalizeBookings(raw: unknown): Booking[] {
  if (Array.isArray(raw)) return raw as Booking[];
  if (!isObj(raw)) return [];
  return Object.entries(raw).map(([tableId, b], i) => ({
    ...(b as Omit<Booking, "id" | "tableId" | "createdAt">),
    id: `migrated-${tableId}-${i}`,
    tableId,
    createdAt: Date.now(),
  }));
}

/**
 * Validate and upgrade any saved/imported state to the current shape.
 * Returns null if it doesn't look like EatingHUB data at all.
 */
export function normalizeState(raw: unknown): PosState | null {
  if (!isObj(raw) || !Array.isArray(raw.bills)) return null;
  const bills = raw.bills.filter((b): b is PosState["bills"][number] => isObj(b) && typeof b.id === "string" && isObj(b.totals) && typeof b.createdAt === "number");
  return {
    ...initialState,
    tables: Array.isArray(raw.tables) && raw.tables.length ? (raw.tables as PosState["tables"]) : initialState.tables,
    sessions: isObj(raw.sessions) ? (raw.sessions as PosState["sessions"]) : {},
    bookings: normalizeBookings(raw.bookings),
    bills,
    billSeq: typeof raw.billSeq === "number" ? raw.billSeq : 0,
    seedVersion: typeof raw.seedVersion === "number" ? raw.seedVersion : 0,
  };
}

/** Split state into the two stored parts. */
export function splitState(state: PosState) {
  const { bills, ...rest } = state;
  return { state: JSON.stringify(rest), bills: JSON.stringify(bills) };
}

/** Rebuild state from the two stored parts (either may be missing). */
export function joinState(stateJson: string | null, billsJson: string | null): PosState | null {
  if (stateJson === null && billsJson === null) return null;
  const rest = stateJson ? JSON.parse(stateJson) : {};
  return normalizeState({ ...rest, bills: billsJson ? JSON.parse(billsJson) : [] });
}

/** Replace old sample bills with the current generation, keeping every real bill. */
export function withCurrentSamples(state: PosState, now = new Date()): PosState {
  if (state.seedVersion >= SEED_VERSION) return state;
  const bills = [...state.bills.filter((b) => !b.demo), ...generateDemoBills(now)].sort((a, b) => b.createdAt - a.createdAt);
  return { ...state, bills, seedVersion: SEED_VERSION };
}

export function readSaved(): PosState | null {
  try {
    const current = joinState(localStorage.getItem(STATE_KEY), localStorage.getItem(BILLS_KEY));
    if (current) return current;
  } catch {}
  for (const key of LEGACY_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      const state = raw ? normalizeState(JSON.parse(raw)) : null;
      if (state) return state;
    } catch {}
  }
  return null;
}

/** Restore state on the client, seeding sample bills when needed. Undefined on the server. */
export function loadState(): PosState | undefined {
  if (typeof window === "undefined") return undefined;
  return withCurrentSamples(readSaved() ?? initialState);
}

const written = { state: "", bills: "" };

/**
 * Save only the parts that changed and report the outcome, so a full or
 * blocked storage never fails silently.
 */
export function saveState(state: PosState) {
  const next = { state: "", bills: "" };
  try {
    const { bills, ...rest } = state;
    next.state = JSON.stringify(rest);
    if (next.state !== written.state) localStorage.setItem(STATE_KEY, next.state);
    written.state = next.state;
    // Bill history is only re-serialised when the array itself changed.
    if (bills !== lastBillsRef) {
      next.bills = JSON.stringify(bills);
      if (next.bills !== written.bills) localStorage.setItem(BILLS_KEY, next.bills);
      written.bills = next.bills;
      lastBillsRef = bills;
    }
    // Once migrated, drop the old single-key copy so it doesn't eat storage.
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
    reportSave({ ok: true, chars: written.state.length + written.bills.length });
  } catch (e) {
    reportSave({ ok: false, chars: (next.state || written.state).length + (next.bills || written.bills).length, error: e instanceof Error ? e.name : "Unknown error" });
  }
}
let lastBillsRef: unknown = null;
