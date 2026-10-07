import type { Bill, PaymentMode } from "@/types/pos";
import { categories, itemById } from "./catalog";

export type Period = "month" | "quarter" | "year" | "lastYear";

export const PERIODS: { id: Period; label: string }[] = [
  { id: "month", label: "This month" },
  { id: "quarter", label: "This quarter" },
  { id: "year", label: "This year" },
  { id: "lastYear", label: "Last year" },
];

export type Range = { start: number; end: number; label: string };

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthName = (d: Date) => d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

/**
 * The selected period and the one it is compared against. Month and quarter
 * compare with the whole previous period; "this year" compares with last year
 * up to the same date, so year-to-date growth is like-for-like.
 */
export function periodRanges(period: Period, now: Date): { current: Range; previous: Range } {
  const y = now.getFullYear();
  const m = now.getMonth();
  const t = now.getTime();
  const span = (start: Date, end: Date, label: string): Range => ({ start: start.getTime(), end: end.getTime(), label });
  const toDate = (prevStart: Date, curStart: Date): number => prevStart.getTime() + (t - curStart.getTime());

  switch (period) {
    case "month": {
      const cs = new Date(y, m, 1);
      const ps = new Date(y, m - 1, 1);
      return { current: span(cs, now, monthName(cs)), previous: span(ps, cs, monthName(ps)) };
    }
    case "quarter": {
      const q = Math.floor(m / 3);
      const cs = new Date(y, q * 3, 1);
      const ps = new Date(y, q * 3 - 3, 1);
      return {
        current: span(cs, now, `Q${q + 1} ${y}`),
        previous: span(ps, cs, `Q${((q + 3) % 4) + 1} ${ps.getFullYear()}`),
      };
    }
    case "year": {
      const cs = new Date(y, 0, 1);
      const ps = new Date(y - 1, 0, 1);
      const sameDay = new Date(toDate(ps, cs));
      return { current: span(cs, now, `${y} to date`), previous: { start: ps.getTime(), end: sameDay.getTime(), label: `${y - 1} to ${sameDay.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` } };
    }
    case "lastYear":
      return { current: span(new Date(y - 1, 0, 1), new Date(y, 0, 1), String(y - 1)), previous: span(new Date(y - 2, 0, 1), new Date(y - 1, 0, 1), String(y - 2)) };
  }
}

export const inRange = (bills: Bill[], r: Range) => bills.filter((b) => b.createdAt >= r.start && b.createdAt < r.end);

export type Summary = { revenue: number; net: number; gst: number; count: number; avg: number; guests: number };

export function summarize(bills: Bill[]): Summary {
  const revenue = bills.reduce((s, b) => s + b.totals.total, 0);
  return {
    revenue,
    net: bills.reduce((s, b) => s + b.totals.taxable, 0),
    gst: bills.reduce((s, b) => s + b.totals.cgst + b.totals.sgst, 0),
    count: bills.length,
    avg: bills.length ? revenue / bills.length : 0,
    guests: bills.reduce((s, b) => s + b.guests, 0),
  };
}

/** Percentage change, or null when there is nothing to compare with. */
export const change = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : null);

function bucket(bills: Bill[], size: number, key: (d: Date) => number) {
  const out = Array<number>(size).fill(0);
  for (const b of bills) out[key(new Date(b.createdAt))] += b.totals.total;
  return out.map(Math.round);
}

export const monthlyRevenue = (bills: Bill[], year: number) =>
  bucket(bills.filter((b) => new Date(b.createdAt).getFullYear() === year), 12, (d) => d.getMonth());

export const quarterlyRevenue = (bills: Bill[], year: number) =>
  bucket(bills.filter((b) => new Date(b.createdAt).getFullYear() === year), 4, (d) => Math.floor(d.getMonth() / 3));

/** Monday-first weekday totals. */
export const weekdayRevenue = (bills: Bill[]) => bucket(bills, 7, (d) => (d.getDay() + 6) % 7);

export type Row = { label: string; value: number; detail?: string };

export function topDishes(bills: Bill[], n = 8): Row[] {
  const agg = new Map<string, { value: number; qty: number }>();
  for (const b of bills)
    for (const l of b.totals.lines) {
      const a = agg.get(l.name) ?? { value: 0, qty: 0 };
      agg.set(l.name, { value: a.value + l.amount, qty: a.qty + l.qty });
    }
  return [...agg]
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, n)
    .map(([label, a]) => ({ label, value: a.value, detail: `${a.qty} sold` }));
}

export function categoryRevenue(bills: Bill[]): Row[] {
  const agg = new Map<string, number>();
  for (const b of bills)
    for (const l of b.totals.lines) {
      const cat = itemById.get(l.itemId)?.categoryId;
      if (cat) agg.set(cat, (agg.get(cat) ?? 0) + l.amount);
    }
  return categories
    .map((c) => ({ label: c.name, value: agg.get(c.id) ?? 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function paymentSplit(bills: Bill[]): { mode: PaymentMode; value: number; count: number }[] {
  return (["UPI", "Card", "Cash"] as const).map((mode) => {
    const of = bills.filter((b) => b.payment === mode);
    return { mode, value: of.reduce((s, b) => s + b.totals.total, 0), count: of.length };
  });
}

/** Round an axis maximum up to a friendly number (1, 2, 2.5, 5 × 10ⁿ). */
export function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const f = v / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
