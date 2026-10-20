import { describe, expect, it } from "vitest";
import type { Bill } from "@/types/pos";
import { change, inRange, monthlyRevenue, niceMax, paymentSplit, periodRanges, quarterlyRevenue, summarize } from "./analytics";

const bill = (at: Date, total: number, payment: Bill["payment"] = "UPI"): Bill => ({
  id: at.toISOString(),
  number: "X",
  tableId: "T1",
  tableName: "Table 1",
  guests: 2,
  createdAt: at.getTime(),
  payment,
  cart: [],
  totals: { lines: [], itemCount: 1, subtotal: total, discountPct: 0, discount: 0, taxable: total / 1.05, serviceCharge: 0, cgst: total * 0.025, sgst: total * 0.025, roundOff: 0, total },
});

describe("periodRanges", () => {
  it("compares this month with the same number of days last month", () => {
    const { current, previous } = periodRanges("month", new Date(2026, 9, 19, 12));
    expect(new Date(current.start)).toEqual(new Date(2026, 9, 1));
    expect(new Date(previous.start)).toEqual(new Date(2026, 8, 1));
    expect(new Date(previous.end)).toEqual(new Date(2026, 8, 19, 12));
    expect(previous.label).toBe("September 2026 (same days)");
  });

  it("never lets the comparison run into the current period (31st vs a 30-day month)", () => {
    const { previous } = periodRanges("month", new Date(2026, 9, 31, 20));
    expect(previous.end).toBeLessThanOrEqual(new Date(2026, 9, 1).getTime());
  });

  it("rolls the previous quarter back into last year in January", () => {
    const { current, previous } = periodRanges("quarter", new Date(2026, 0, 15));
    expect(current.label).toBe("Q1 2026");
    expect(previous.label).toBe("Q4 2025 (same days)");
    expect(new Date(previous.start)).toEqual(new Date(2025, 9, 1));
  });

  it("compares year-to-date with last year up to the same date", () => {
    const now = new Date(2026, 9, 19, 12);
    const { previous } = periodRanges("year", now);
    expect(new Date(previous.start)).toEqual(new Date(2025, 0, 1));
    expect(new Date(previous.end).getMonth()).toBe(9);
    expect(new Date(previous.end).getFullYear()).toBe(2025);
  });

  it("treats last year as a full calendar year", () => {
    const { current, previous } = periodRanges("lastYear", new Date(2026, 5, 1));
    expect(current.label).toBe("2025");
    expect(previous.label).toBe("2024");
    expect(new Date(current.end)).toEqual(new Date(2026, 0, 1));
  });
});

describe("aggregations", () => {
  const bills = [bill(new Date(2026, 0, 5), 1000), bill(new Date(2026, 1, 10), 500, "Cash"), bill(new Date(2026, 1, 20), 300, "Card"), bill(new Date(2025, 11, 31), 999)];

  it("summarises revenue, count and average", () => {
    const s = summarize(bills.slice(0, 3));
    expect(s.revenue).toBe(1800);
    expect(s.count).toBe(3);
    expect(s.avg).toBe(600);
  });

  it("buckets revenue by month and by quarter for one year only", () => {
    expect(monthlyRevenue(bills, 2026).slice(0, 3)).toEqual([1000, 800, 0]);
    expect(quarterlyRevenue(bills, 2026)).toEqual([1800, 0, 0, 0]);
    expect(quarterlyRevenue(bills, 2025)).toEqual([0, 0, 0, 999]);
  });

  it("filters bills to a range (end exclusive)", () => {
    const r = { start: new Date(2026, 1, 1).getTime(), end: new Date(2026, 1, 20).getTime(), label: "" };
    expect(inRange(bills, r)).toHaveLength(1);
  });

  it("splits revenue by payment mode", () => {
    expect(paymentSplit(bills.slice(0, 3)).map((p) => [p.mode, p.value])).toEqual([["UPI", 1000], ["Card", 300], ["Cash", 500]]);
  });

  it("returns null change when there is nothing to compare with", () => {
    expect(change(100, 0)).toBeNull();
    expect(change(150, 100)).toBe(50);
  });

  it("rounds axis maxima to friendly numbers", () => {
    expect(niceMax(0)).toBe(1);
    expect(niceMax(1800)).toBe(2000);
    expect(niceMax(2300)).toBe(2500);
    expect(niceMax(7300)).toBe(10000);
  });
});
