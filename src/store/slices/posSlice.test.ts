import { describe, expect, it } from "vitest";
import type { PosState } from "@/types/pos";
import reducer, { addItem, archiveBills, bookTable, cancelBooking, freeTable, initialState, moveTable, removeTable, seatBooking, seatTable, sendToKitchen, setTicketStatus, settleBill, toggleSoldOut, voidBill } from "./posSlice";

const run = (state: PosState, ...actions: Parameters<typeof reducer>[1][]) => actions.reduce(reducer, state);
const booked = () => run(initialState, bookTable({ tableId: "T1", name: "Priya", phone: "", guests: 4, at: "2026-10-19T20:30" }));

describe("reservations", () => {
  it("keeps the booking when a walk-in is seated or orders", () => {
    const s = run(booked(), seatTable({ tableId: "T1", guests: 2 }), addItem({ tableId: "T1", itemId: "paneer-tikka" }));
    expect(s.bookings).toHaveLength(1);
    expect(s.sessions.T1.guests).toBe(2);
    expect(s.sessions.T1.guestName).toBeUndefined();
  });

  it("seats the booked party and closes only that booking", () => {
    const two = run(booked(), bookTable({ tableId: "T1", name: "Rahul", phone: "", guests: 2, at: "2026-10-19T13:00" }));
    const priya = two.bookings.find((b) => b.name === "Priya")!;
    const s = run(two, seatBooking(priya.id));
    expect(s.sessions.T1).toMatchObject({ guests: 4, guestName: "Priya" });
    expect(s.bookings.map((b) => b.name)).toEqual(["Rahul"]);
  });

  it("won't seat a booking while the table is occupied", () => {
    const s0 = run(booked(), seatTable({ tableId: "T1" }));
    const s = run(s0, seatBooking(s0.bookings[0].id));
    expect(s.bookings).toHaveLength(1);
  });

  it("cancels a booking by id", () => {
    const s = booked();
    expect(run(s, cancelBooking(s.bookings[0].id)).bookings).toEqual([]);
  });
});

describe("tables", () => {
  it("never removes a table with guests on it", () => {
    const s = run(initialState, seatTable({ tableId: "T1" }), removeTable("T1"));
    expect(s.tables.some((t) => t.id === "T1")).toBe(true);
  });

  it("removes the table's bookings with it", () => {
    const s = run(booked(), removeTable("T1"));
    expect(s.tables.some((t) => t.id === "T1")).toBe(false);
    expect(s.bookings).toEqual([]);
  });
});

describe("billing", () => {
  it("settles into a numbered bill and frees the table", () => {
    const s = run(initialState, addItem({ tableId: "T1", itemId: "paneer-tikka" }), settleBill("T1", "Cash"));
    expect(s.sessions.T1).toBeUndefined();
    expect(s.bills).toHaveLength(1);
    expect(s.bills[0].number).toMatch(/^INV-\d{8}-0001$/);
    expect(s.bills[0]).toMatchObject({ payment: "Cash", tableName: "Table 1" });
    expect(s.bills[0].totals.total).toBe(294);
  });

  it("does not create a bill for an empty order", () => {
    const s = run(initialState, seatTable({ tableId: "T1" }), settleBill("T1", "UPI"));
    expect(s.bills).toEqual([]);
    expect(s.billSeq).toBe(0);
  });

  it("archives only bills older than the cutoff", () => {
    const s0 = run(initialState, addItem({ tableId: "T1", itemId: "paneer-tikka" }), settleBill("T1", "Cash"));
    const old = { ...s0.bills[0], id: "old", createdAt: new Date(2020, 0, 1).getTime() };
    const s = run({ ...s0, bills: [...s0.bills, old] }, archiveBills({ before: new Date(2024, 0, 1).getTime() }));
    expect(s.bills.map((b) => b.id)).not.toContain("old");
    expect(s.bills).toHaveLength(1);
  });
});

describe("kitchen tickets", () => {
  const ordered = () => run(initialState, addItem({ tableId: "T1", itemId: "paneer-tikka" }), addItem({ tableId: "T1", itemId: "paneer-tikka" }));

  it("sends a numbered KOT and only the new items next time", () => {
    const s1 = run(ordered(), sendToKitchen("T1"));
    expect(s1.tickets).toHaveLength(1);
    expect(s1.tickets[0]).toMatchObject({ number: "KOT-0001", tableName: "Table 1", status: "new", lines: [{ itemId: "paneer-tikka", qty: 2 }] });

    const s2 = run(s1, sendToKitchen("T1"));
    expect(s2.tickets).toHaveLength(1); // nothing new: no empty ticket

    const s3 = run(s2, addItem({ tableId: "T1", itemId: "paneer-tikka" }), sendToKitchen("T1"));
    expect(s3.tickets[1]).toMatchObject({ number: "KOT-0002", lines: [{ qty: 1 }] });
  });

  it("advances ticket status and stops at served", () => {
    const s = run(ordered(), sendToKitchen("T1"));
    const id = s.tickets[0].id;
    const after = run(s, setTicketStatus({ id }), setTicketStatus({ id }), setTicketStatus({ id }), setTicketStatus({ id }));
    expect(after.tickets[0].status).toBe("served");
  });

  it("follows the order when it moves table", () => {
    const s = run(ordered(), sendToKitchen("T1"), moveTable({ from: "T1", to: "T2" }));
    expect(s.tickets[0]).toMatchObject({ tableId: "T2", tableName: "Table 2" });
  });

  it("marks tickets served on settle, and drops open ones when the table is freed unbilled", () => {
    expect(run(ordered(), sendToKitchen("T1"), settleBill("T1", "Cash")).tickets[0].status).toBe("served");
    expect(run(ordered(), sendToKitchen("T1"), freeTable("T1")).tickets).toEqual([]);
  });
});

describe("sold out", () => {
  it("blocks adding a sold-out dish and can be undone", () => {
    const s = run(initialState, toggleSoldOut("paneer-tikka"), addItem({ tableId: "T1", itemId: "paneer-tikka" }));
    expect(s.sessions.T1).toBeUndefined();
    expect(run(s, toggleSoldOut("paneer-tikka")).soldOut).toEqual([]);
  });
});

describe("voiding", () => {
  it("keeps the bill but marks it void once", () => {
    const s = run(initialState, addItem({ tableId: "T1", itemId: "paneer-tikka" }), settleBill("T1", "UPI"));
    const id = s.bills[0].id;
    const v = run(s, voidBill(id, "  wrong table  "));
    expect(v.bills).toHaveLength(1);
    expect(v.bills[0].voided?.reason).toBe("wrong table");
    expect(run(v, voidBill(id, "again")).bills[0].voided?.reason).toBe("wrong table");
  });
});
