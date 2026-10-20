import { describe, expect, it } from "vitest";
import { DEMO_BILL_COUNT } from "@/lib/demo-bills";
import { initialState } from "./slices/posSlice";
import { joinState, normalizeState, SEED_VERSION, splitState, withCurrentSamples } from "./persistence";

describe("normalizeState", () => {
  it("rejects data that isn't an EatingHUB save", () => {
    expect(normalizeState(null)).toBeNull();
    expect(normalizeState("hello")).toBeNull();
    expect(normalizeState({ foo: 1 })).toBeNull();
  });

  it("upgrades the old one-booking-per-table format", () => {
    const s = normalizeState({
      bills: [],
      bookings: { T3: { name: "Priya", phone: "", guests: 4, at: "2026-10-19T20:30" } },
    })!;
    expect(s.bookings).toHaveLength(1);
    expect(s.bookings[0]).toMatchObject({ tableId: "T3", name: "Priya" });
    expect(typeof s.bookings[0].id).toBe("string");
  });

  it("drops malformed bills and fills in defaults", () => {
    const good = { id: "b1", createdAt: 1, totals: { total: 10 } };
    const s = normalizeState({ bills: [good, { id: 2 }, "junk"] })!;
    expect(s.bills.map((b) => b.id)).toEqual(["b1"]);
    expect(s.tables.length).toBeGreaterThan(0);
    expect(s.sessions).toEqual({});
    expect(s.billSeq).toBe(0);
  });
});

describe("split storage", () => {
  it("round-trips state through the two storage keys", () => {
    const state = withCurrentSamples(initialState, new Date(2026, 9, 19, 21));
    const { state: s, bills } = splitState(state);
    expect(s).not.toContain('"bills"');
    expect(joinState(s, bills)).toEqual(state);
  });

  it("returns null when nothing is stored", () => {
    expect(joinState(null, null)).toBeNull();
  });
});

describe("withCurrentSamples", () => {
  const real = { id: "real-1", number: "INV-20261019-0001", tableId: "T1", tableName: "Table 1", guests: 2, createdAt: 1, payment: "UPI" as const, cart: [], totals: { lines: [], itemCount: 0, subtotal: 0, discountPct: 0, discount: 0, taxable: 0, serviceCharge: 0, cgst: 0, sgst: 0, roundOff: 0, total: 0 } };

  it("replaces old sample bills with the new set and keeps real bills", () => {
    const oldSample = { ...real, id: "demo-1", demo: true };
    const s = withCurrentSamples({ ...initialState, bills: [real, oldSample], seedVersion: 1 });
    expect(s.seedVersion).toBe(SEED_VERSION);
    expect(s.bills.filter((b) => b.demo)).toHaveLength(DEMO_BILL_COUNT);
    expect(s.bills.some((b) => b.id === "real-1")).toBe(true);
    expect(s.bills.filter((b) => b.id === "demo-1" && b.createdAt === 1)).toHaveLength(0);
  });

  it("does nothing once samples are current", () => {
    const s = { ...initialState, seedVersion: SEED_VERSION };
    expect(withCurrentSamples(s)).toBe(s);
  });
});
