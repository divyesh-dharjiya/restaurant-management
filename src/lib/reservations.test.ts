import { describe, expect, it } from "vitest";
import type { Booking } from "@/types/pos";
import { toLocalInput } from "./format";
import { bookingState, clashes, holdingBooking, minutesLate } from "./reservations";

const NOW = new Date(2026, 9, 19, 19, 0).getTime();
const at = (minFromNow: number) => toLocalInput(new Date(NOW + minFromNow * 60_000));
const booking = (id: string, minFromNow: number, tableId = "T1"): Booking => ({ id, tableId, name: id, phone: "", guests: 2, at: at(minFromNow), createdAt: 0 });

describe("bookingState", () => {
  it("is upcoming more than 2 hours ahead", () => expect(bookingState(booking("a", 180), NOW)).toBe("upcoming"));
  it("is due within 2 hours before and 30 minutes after", () => {
    expect(bookingState(booking("a", 90), NOW)).toBe("due");
    expect(bookingState(booking("a", -20), NOW)).toBe("due");
  });
  it("is late after the 30 minute grace period", () => {
    const b = booking("a", -45);
    expect(bookingState(b, NOW)).toBe("late");
    expect(minutesLate(b, NOW)).toBe(45);
  });
});

describe("holdingBooking", () => {
  it("ignores bookings later in the day so walk-ins can use the table", () => {
    expect(holdingBooking([booking("dinner", 300)], "T1", NOW)).toBeUndefined();
  });
  it("returns the due booking for that table only", () => {
    const list = [booking("other", 30, "T2"), booking("mine", 60)];
    expect(holdingBooking(list, "T1", NOW)?.id).toBe("mine");
  });
});

describe("clashes", () => {
  const list = [booking("lunch", 60), booking("dinner", 400)];
  it("flags bookings on the same table less than 90 minutes apart", () => {
    expect(clashes(list, "T1", at(100)).map((b) => b.id)).toEqual(["lunch"]);
  });
  it("allows lunch and dinner on the same table", () => {
    expect(clashes(list, "T1", at(240))).toEqual([]);
  });
  it("ignores other tables and the booking being edited", () => {
    expect(clashes(list, "T2", at(60))).toEqual([]);
    expect(clashes(list, "T1", at(60), "lunch")).toEqual([]);
  });
});
