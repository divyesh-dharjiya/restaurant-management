import type { Bill, PaymentMode } from "@/types/pos";
import { computeBill, type CartLine } from "./billing";
import { items, seedTables } from "./catalog";
import { ymd } from "./format";

export const DEMO_BILL_COUNT = 60;

/** Relative footfall per calendar month (festive Oct–Dec peak, monsoon dip). */
const SEASON = [1, 0.95, 1.05, 1, 0.9, 0.85, 0.8, 0.9, 1, 1.2, 1.25, 1.15];
const PAYMENTS: [PaymentMode, number][] = [["UPI", 0.55], ["Card", 0.25], ["Cash", 0.2]];

/** Small deterministic PRNG so every browser gets the same-shaped sample data. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Split `total` across weights (largest-remainder), giving every bucket at least one. */
function allocate(weights: number[], total: number) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / sum) * total);
  const out = raw.map((r) => Math.max(1, Math.floor(r)));
  const byFraction = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  let diff = total - out.reduce((a, b) => a + b, 0);
  for (let k = 0; diff > 0; k++, diff--) out[byFraction[k % out.length][1]]++;
  while (diff < 0) {
    const i = out.indexOf(Math.max(...out));
    out[i]--;
    diff++;
  }
  return out;
}

/**
 * Sample bill history from 1 Jan last year up to yesterday, so the dashboard's
 * month / quarter / year / last-year views all have data on first run.
 */
export function generateDemoBills(now = new Date(), total = DEMO_BILL_COUNT): Bill[] {
  const rand = mulberry32(20261007);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
  const between = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

  const months: { y: number; m: number; days: number; weight: number }[] = [];
  for (let d = new Date(now.getFullYear() - 1, 0, 1); d <= now; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    const y = d.getFullYear();
    const m = d.getMonth();
    const inMonth = new Date(y, m + 1, 0).getDate();
    const current = y === now.getFullYear() && m === now.getMonth();
    const days = current ? Math.max(1, now.getDate() - 1) : inMonth;
    const growth = 1 + months.length * 0.025;
    months.push({ y, m, days, weight: SEASON[m] * growth * (current ? Math.max(0.35, days / inMonth) : 1) });
  }

  // Bestsellers are three times as likely to be ordered.
  const pool = items.flatMap((i) => (i.popular ? [i, i, i] : [i]));
  const counts = allocate(months.map((x) => x.weight), total);

  const drafts = months.flatMap(({ y, m, days }, mi) =>
    Array.from({ length: counts[mi] }, () => {
      const lunch = rand() < 0.4;
      let at = new Date(y, m, between(1, days), lunch ? between(12, 14) : between(19, 22), pick([0, 10, 15, 25, 30, 40, 45, 55]));
      if (at >= now) at = new Date(now.getTime() - between(2, 20) * 3_600_000);

      const cart: CartLine[] = [];
      for (let n = between(2, 6); cart.length < n; ) {
        const item = pick(pool);
        if (!cart.some((l) => l.itemId === item.id)) cart.push({ itemId: item.id, qty: 1 + (rand() < 0.3 ? 1 : 0) + (rand() < 0.08 ? 1 : 0) });
      }
      const r = rand();
      const payment = r < PAYMENTS[0][1] ? "UPI" : r < PAYMENTS[0][1] + PAYMENTS[1][1] ? "Card" : "Cash";
      const table = pick(seedTables);
      return { at, cart, payment: payment as PaymentMode, table, guests: between(2, Math.max(2, table.seats)), discount: rand() < 0.12 ? pick([5, 10]) : 0 };
    }),
  );

  return drafts
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .map((d, i) => ({
      id: `demo-${i + 1}`,
      number: `INV-${ymd(d.at)}-D${String(i + 1).padStart(3, "0")}`,
      tableId: d.table.id,
      tableName: d.table.name,
      guests: d.guests,
      createdAt: d.at.getTime(),
      payment: d.payment,
      cart: d.cart,
      totals: computeBill(d.cart, d.discount),
      demo: true,
    }))
    .reverse();
}
