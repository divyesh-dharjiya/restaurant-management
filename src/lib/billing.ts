import { itemById, tax } from "./catalog";

export type CartLine = { itemId: string; qty: number; note?: string };

export type BillLine = { itemId: string; name: string; price: number; qty: number; amount: number };

export type BillTotals = {
  lines: BillLine[];
  itemCount: number;
  subtotal: number;
  discountPct: number;
  discount: number;
  taxable: number;
  serviceCharge: number;
  cgst: number;
  sgst: number;
  roundOff: number;
  total: number;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

/** GST is applied on (subtotal - discount + service charge), split into CGST + SGST. */
export function computeBill(cart: CartLine[], discountPct = 0): BillTotals {
  const lines: BillLine[] = cart.flatMap((c) => {
    const item = itemById.get(c.itemId);
    if (!item) return [];
    return [{ itemId: c.itemId, name: item.name, price: item.price, qty: c.qty, amount: item.price * c.qty }];
  });

  const subtotal = r2(lines.reduce((s, l) => s + l.amount, 0));
  const discount = r2((subtotal * discountPct) / 100);
  const serviceCharge = r2(((subtotal - discount) * tax.serviceCharge) / 100);
  const taxable = r2(subtotal - discount + serviceCharge);
  const cgst = r2((taxable * tax.cgst) / 100);
  const sgst = r2((taxable * tax.sgst) / 100);
  const gross = taxable + cgst + sgst;
  const total = Math.round(gross);

  return {
    lines,
    itemCount: lines.reduce((s, l) => s + l.qty, 0),
    subtotal,
    discountPct,
    discount,
    taxable,
    serviceCharge,
    cgst,
    sgst,
    roundOff: r2(total - gross),
    total,
  };
}

/**
 * Split a (whole-rupee) total between `ways` people in whole rupees.
 * Shares differ by at most ₹1 and always add up to the total.
 */
export function splitEvenly(total: number, ways: number): number[] {
  const n = Math.max(1, Math.floor(ways));
  const base = Math.floor(total / n);
  const extra = Math.round(total - base * n);
  return Array.from({ length: n }, (_, i) => base + (i < extra ? 1 : 0));
}
