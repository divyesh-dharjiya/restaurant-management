import { describe, expect, it } from "vitest";
import { computeBill, splitEvenly } from "./billing";

// Prices from menu.json: Paneer Tikka ₹280, Butter Naan ₹60.
const cart = [
  { itemId: "paneer-tikka", qty: 2 },
  { itemId: "butter-naan", qty: 3 },
];

describe("computeBill", () => {
  it("adds CGST + SGST at 2.5% each on the subtotal", () => {
    const t = computeBill(cart);
    expect(t.subtotal).toBe(740);
    expect(t.taxable).toBe(740);
    expect(t.cgst).toBe(18.5);
    expect(t.sgst).toBe(18.5);
    expect(t.total).toBe(777);
    expect(t.roundOff).toBe(0);
    expect(t.itemCount).toBe(5);
  });

  it("applies the discount before tax and rounds the total to the rupee", () => {
    const t = computeBill(cart, 10);
    expect(t.discount).toBe(74);
    expect(t.taxable).toBe(666);
    expect(t.cgst).toBe(16.65);
    expect(t.sgst).toBe(16.65);
    // 666 + 33.30 = 699.30 → 699, round-off −0.30
    expect(t.total).toBe(699);
    expect(t.roundOff).toBe(-0.3);
  });

  it("builds one invoice line per item with its amount", () => {
    const t = computeBill(cart);
    expect(t.lines).toEqual([
      { itemId: "paneer-tikka", name: "Paneer Tikka", price: 280, qty: 2, amount: 560 },
      { itemId: "butter-naan", name: "Butter Naan", price: 60, qty: 3, amount: 180 },
    ]);
  });

  it("ignores items that are no longer on the menu", () => {
    const t = computeBill([...cart, { itemId: "does-not-exist", qty: 4 }]);
    expect(t.lines).toHaveLength(2);
    expect(t.subtotal).toBe(740);
  });

  it("returns zeros for an empty cart", () => {
    const t = computeBill([]);
    expect(t).toMatchObject({ subtotal: 0, cgst: 0, sgst: 0, total: 0, itemCount: 0 });
  });
});

describe("splitEvenly", () => {
  it.each([
    [1000, 4, [250, 250, 250, 250]],
    [1001, 4, [251, 250, 250, 250]],
    [1003, 3, [335, 334, 334]],
    [500, 1, [500]],
  ])("₹%i between %i", (total, ways, shares) => {
    expect(splitEvenly(total, ways)).toEqual(shares);
    expect(splitEvenly(total, ways).reduce((a, b) => a + b, 0)).toBe(total);
  });

  it("treats nonsense counts as one payer", () => {
    expect(splitEvenly(300, 0)).toEqual([300]);
    expect(splitEvenly(300, -2)).toEqual([300]);
  });
});
