import { describe, expect, it } from "vitest";
import type { KitchenTicket } from "@/types/pos";
import { SERVED_TICKET_TTL_MS, nextStatus, pendingLines, pruneTickets, sentSnapshot, unsentCount } from "./kitchen";

describe("pendingLines", () => {
  it("sends everything on the first KOT, with notes", () => {
    const lines = pendingLines({ cart: [{ itemId: "paneer-tikka", qty: 2, note: "less spicy" }, { itemId: "butter-naan", qty: 4 }] });
    expect(lines).toEqual([
      { itemId: "paneer-tikka", name: "Paneer Tikka", qty: 2, note: "less spicy" },
      { itemId: "butter-naan", name: "Butter Naan", qty: 4 },
    ]);
  });

  it("sends only the extra quantity after a KOT", () => {
    const lines = pendingLines({ cart: [{ itemId: "butter-naan", qty: 6 }], sent: { "butter-naan": 4 } });
    expect(lines).toEqual([{ itemId: "butter-naan", name: "Butter Naan", qty: 2 }]);
  });

  it("turns reductions and removals into cancellation lines", () => {
    const lines = pendingLines({ cart: [{ itemId: "butter-naan", qty: 1 }], sent: { "butter-naan": 3, "paneer-tikka": 2 } });
    expect(lines).toEqual([
      { itemId: "butter-naan", name: "Butter Naan", qty: -2 },
      { itemId: "paneer-tikka", name: "Paneer Tikka", qty: -2 },
    ]);
  });

  it("is empty when the kitchen is up to date", () => {
    const cart = [{ itemId: "butter-naan", qty: 2 }];
    expect(pendingLines({ cart, sent: sentSnapshot({ cart }) })).toEqual([]);
  });

  it("counts only dishes still to cook", () => {
    expect(unsentCount({ cart: [{ itemId: "butter-naan", qty: 5 }], sent: { "butter-naan": 2, "paneer-tikka": 1 } })).toBe(3);
  });
});

describe("ticket lifecycle", () => {
  it("moves forward and stops at served", () => {
    expect(nextStatus("new")).toBe("preparing");
    expect(nextStatus("preparing")).toBe("ready");
    expect(nextStatus("ready")).toBe("served");
    expect(nextStatus("served")).toBe("served");
  });

  it("prunes only old served tickets", () => {
    const t = (status: KitchenTicket["status"], createdAt: number) => ({ id: `${status}${createdAt}`, number: "", tableId: "T1", tableName: "", createdAt, status, lines: [] });
    const now = SERVED_TICKET_TTL_MS * 2;
    const kept = pruneTickets([t("served", 0), t("served", now - 1000), t("new", 0)], now);
    expect(kept.map((x) => x.id)).toEqual([`served${now - 1000}`, "new0"]);
  });
});
