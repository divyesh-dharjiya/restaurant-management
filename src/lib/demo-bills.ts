import type { Bill, PaymentMode, Table } from "@/types/pos";
import { computeBill, type CartLine } from "./billing";
import { items, seedTables, type MenuItem } from "./catalog";
import { ymd } from "./format";

export const DEMO_BILL_COUNT = 1250;

/** Relative footfall per calendar month (festive Oct–Dec peak, monsoon dip). */
const SEASON = [1, 0.95, 1.05, 1, 0.9, 0.85, 0.8, 0.9, 1, 1.2, 1.25, 1.15];
/** Relative footfall per weekday, Sunday first (weekends busiest). */
const WEEKDAY = [1.45, 0.75, 0.8, 0.85, 0.95, 1.25, 1.6];
/** Party size → likelihood. */
const PARTY: [number, number][] = [[1, 0.05], [2, 0.34], [3, 0.18], [4, 0.27], [5, 0.06], [6, 0.1]];
const PAYMENTS: [PaymentMode, number][] = [["UPI", 0.58], ["Card", 0.27], ["Cash", 0.15]];

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

/** Split `total` across weights (largest remainder). */
function allocate(weights: number[], total: number) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / sum) * total);
  const out = raw.map(Math.floor);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0, left = total - out.reduce((a, b) => a + b, 0); left > 0; k++, left--) out[order[k % out.length][1]]++;
  return out;
}

const DAY = 86_400_000;
const byCat = (...ids: string[]) => items.filter((i) => ids.includes(i.categoryId));
const STARTERS = byCat("starters", "soups");
const INDIAN_MAINS = byCat("main");
const OTHER_MAINS = byCat("rice", "chinese", "pizza", "southindian");
const BREADS = byCat("breads");
const DRINKS = byCat("beverages");
const DESSERTS = byCat("desserts");

/**
 * Sample bill history from 1 Jan last year up to an hour ago, so every dashboard
 * view (today, month, quarter, year, last year) has realistic data. Orders are
 * built from the party size — starters, mains, breads, drinks, dessert — and all
 * totals go through the same `computeBill` as real bills, so GST is exact.
 */
export function generateDemoBills(now = new Date(), total = DEMO_BILL_COUNT): Bill[] {
  const rand = mulberry32(20261007);
  const between = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
  const weighted = <T,>(opts: [T, number][]) => {
    let r = rand();
    for (const [v, w] of opts) if ((r -= w) <= 0) return v;
    return opts[opts.length - 1][0];
  };
  // Bestsellers are three times as likely to be picked.
  const pick = (pool: MenuItem[]) => {
    const weightedPool = pool.flatMap((i) => (i.popular ? [i, i, i] : [i]));
    return weightedPool[Math.floor(rand() * weightedPool.length)];
  };

  // Weight each day by season × weekday × slow growth (newer days busier).
  const start = new Date(now.getFullYear() - 1, 0, 1);
  const lastServiceEnd = now.getTime() - 60 * 60_000;
  const days: Date[] = [];
  for (let d = new Date(start); d.getTime() <= now.getTime(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) days.push(d);
  const weights = days.map((d, i) => SEASON[d.getMonth()] * WEEKDAY[d.getDay()] * (1 + (i / days.length) * 0.35) * (0.85 + rand() * 0.3));
  const perDay = allocate(weights, total);

  const tablesFor = (guests: number): Table[] => seedTables.filter((t) => t.seats >= guests && t.seats <= guests + 2);

  const drafts: { at: Date; cart: CartLine[]; guests: number; table: Table; payment: PaymentMode; discount: number }[] = [];
  days.forEach((day, di) => {
    for (let n = 0; n < perDay[di]; n++) {
      // Lunch 12:00–15:00 (40%), dinner 19:00–23:00 (60%).
      const lunch = rand() < 0.4;
      let at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), lunch ? between(12, 14) : between(19, 22), between(0, 59));
      if (at.getTime() > lastServiceEnd) {
        // Today's later slots haven't happened yet: move into today's past, else yesterday's dinner.
        const earliest = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12).getTime();
        at = lastServiceEnd > earliest ? new Date(earliest + rand() * (lastServiceEnd - earliest)) : new Date(at.getTime() - DAY);
      }

      const guests = weighted(PARTY);
      const lines = new Map<string, number>();
      const add = (item: MenuItem, qty = 1) => lines.set(item.id, (lines.get(item.id) ?? 0) + qty);

      for (let s = Math.ceil(guests / 3); s > 0; s--) add(pick(STARTERS));
      const indian = rand() < 0.65;
      for (let m = Math.max(1, Math.round(guests * 0.6)); m > 0; m--) add(pick(indian ? INDIAN_MAINS : OTHER_MAINS));
      if (indian) {
        add(pick(BREADS), Math.max(1, guests + between(-1, 2)));
        if (guests >= 3 && rand() < 0.5) add(pick(BREADS), between(1, 2));
      }
      if (rand() < 0.75) add(pick(DRINKS), between(1, guests));
      if (rand() < 0.4) add(pick(DESSERTS), between(1, Math.max(1, Math.ceil(guests / 2))));

      const options = tablesFor(guests);
      drafts.push({
        at,
        cart: [...lines].map(([itemId, qty]) => ({ itemId, qty })),
        guests,
        table: options[Math.floor(rand() * options.length)] ?? seedTables[0],
        payment: weighted(PAYMENTS),
        discount: rand() < 0.08 ? weighted([[5, 0.5], [10, 0.4], [15, 0.1]]) : 0,
      });
    }
  });

  return drafts
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .map((d, i) => ({
      id: `demo-${i + 1}`,
      number: `INV-${ymd(d.at)}-D${String(i + 1).padStart(4, "0")}`,
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
