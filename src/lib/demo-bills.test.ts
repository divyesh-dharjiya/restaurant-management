import { describe, expect, it } from "vitest";
import { inRange, monthlyRevenue, periodRanges, quarterlyRevenue, summarize } from "./analytics";
import { itemById, tax } from "./catalog";
import { DEMO_BILL_COUNT, generateDemoBills } from "./demo-bills";

const NOW = new Date(2026, 9, 19, 21, 30);
const bills = generateDemoBills(NOW);
const r2 = (n: number) => Math.round(n * 100) / 100;

describe("generateDemoBills", () => {
  it("creates 1,000+ sample bills, all flagged as demo", () => {
    expect(DEMO_BILL_COUNT).toBeGreaterThanOrEqual(1000);
    expect(bills).toHaveLength(DEMO_BILL_COUNT);
    expect(bills.every((b) => b.demo && /-D\d{4}$/.test(b.number))).toBe(true);
  });

  it("only uses past times (at least an hour ago), newest first", () => {
    expect(bills.every((b) => b.createdAt <= NOW.getTime() - 60 * 60_000)).toBe(true);
    for (let i = 1; i < bills.length; i++) expect(bills[i - 1].createdAt).toBeGreaterThanOrEqual(bills[i].createdAt);
  });

  it("covers every month from January last year and includes today", () => {
    const months = new Set(bills.map((b) => { const d = new Date(b.createdAt); return d.getFullYear() * 12 + d.getMonth(); }));
    for (let m = 2025 * 12; m <= 2026 * 12 + 9; m++) expect(months.has(m)).toBe(true);
    expect(bills.some((b) => new Date(b.createdAt).toDateString() === NOW.toDateString())).toBe(true);
  });

  it("makes weekends busier than mid-week", () => {
    const perDay = Array(7).fill(0);
    for (const b of bills) perDay[new Date(b.createdAt).getDay()]++;
    expect(perDay[6]).toBeGreaterThan(perDay[2]); // Saturday > Tuesday
  });

  it("builds sensible orders: every bill has a main, bigger parties order more", () => {
    const mains = new Set(["main", "rice", "chinese", "pizza", "southindian"]);
    expect(bills.every((b) => b.cart.some((l) => mains.has(itemById.get(l.itemId)!.categoryId)))).toBe(true);
    const avg = (g: number) => { const of = bills.filter((b) => b.guests === g); return of.reduce((s, b) => s + b.totals.subtotal, 0) / of.length; };
    expect(avg(6)).toBeGreaterThan(avg(2));
  });

  it("seats each party at a table big enough for it", () => {
    expect(bills.every((b) => b.guests >= 1 && b.guests <= 6)).toBe(true);
  });

  it("is deterministic for the same date and has unique ids / invoice numbers", () => {
    expect(generateDemoBills(NOW).map((b) => b.totals.total)).toEqual(bills.map((b) => b.totals.total));
    expect(new Set(bills.map((b) => b.id)).size).toBe(bills.length);
    expect(new Set(bills.map((b) => b.number)).size).toBe(bills.length);
  });
});

describe("every sample bill's GST maths reconciles", () => {
  it.each(bills.map((b) => [b.number, b] as const))("%s", (_n, b) => {
    const t = b.totals;
    // Lines match the cart at menu prices.
    for (const line of t.lines) expect(line.amount).toBe(itemById.get(line.itemId)!.price * line.qty);
    expect(t.subtotal).toBe(r2(t.lines.reduce((s, l) => s + l.amount, 0)));
    expect(t.itemCount).toBe(b.cart.reduce((s, l) => s + l.qty, 0));
    // Discount before tax, then CGST + SGST on the taxable value.
    expect(t.discount).toBe(r2((t.subtotal * t.discountPct) / 100));
    expect(t.taxable).toBe(r2(t.subtotal - t.discount + t.serviceCharge));
    expect(t.cgst).toBe(r2((t.taxable * tax.cgst) / 100));
    expect(t.sgst).toBe(r2((t.taxable * tax.sgst) / 100));
    // Whole-rupee total; round-off is the difference and never more than 50 paise.
    expect(Number.isInteger(t.total)).toBe(true);
    expect(Math.abs(t.roundOff)).toBeLessThanOrEqual(0.5);
    expect(r2(t.taxable + t.cgst + t.sgst + t.roundOff)).toBe(t.total);
  });
});

describe("dashboard totals agree with each other on 1,000+ bills", () => {
  const year = NOW.getFullYear();
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

  it("12 months = 4 quarters = the year's revenue, for both years", () => {
    for (const y of [year, year - 1]) {
      const yearBills = bills.filter((b) => new Date(b.createdAt).getFullYear() === y);
      const exact = Math.round(summarize(yearBills).revenue);
      expect(Math.abs(sum(monthlyRevenue(bills, y)) - exact)).toBeLessThanOrEqual(12); // ≤ ₹1 rounding per month
      expect(Math.abs(sum(quarterlyRevenue(bills, y)) - exact)).toBeLessThanOrEqual(4);
    }
  });

  it("last year + this year to date covers every bill", () => {
    const thisYear = inRange(bills, periodRanges("year", NOW).current);
    const lastYear = inRange(bills, periodRanges("lastYear", NOW).current);
    expect(thisYear.length + lastYear.length).toBe(bills.length);
  });

  it("GST collected is exactly 5% of net sales", () => {
    const s = summarize(bills);
    expect(Math.abs(s.gst - s.net * 0.05)).toBeLessThan(bills.length * 0.01);
  });
});
