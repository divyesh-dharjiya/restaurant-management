import type { Booking, BookingState } from "@/types/pos";

const MIN = 60_000;

/** A table shows as "Reserved" from this long before the booking… */
export const HOLD_BEFORE_MIN = 120;
/** …and the party counts as late (possible no-show) after this long past the slot. */
export const GRACE_AFTER_MIN = 30;
/** Two bookings on one table closer than this clash. */
export const MIN_GAP_MIN = 90;

export const bookingTime = (b: Pick<Booking, "at">) => new Date(b.at).getTime();

export function bookingState(b: Booking, now: number): BookingState {
  const diff = bookingTime(b) - now;
  if (diff > HOLD_BEFORE_MIN * MIN) return "upcoming";
  if (diff >= -GRACE_AFTER_MIN * MIN) return "due";
  return "late";
}

/** Minutes past the booked time (0 if not yet due). */
export const minutesLate = (b: Booking, now: number) => Math.max(0, Math.floor((now - bookingTime(b)) / MIN));

export const sortByTime = (list: Booking[]) => [...list].sort((a, b) => bookingTime(a) - bookingTime(b));

export const bookingsFor = (list: Booking[], tableId: string) => sortByTime(list.filter((b) => b.tableId === tableId));

/** The booking that currently holds the table (due or late), if any. */
export const holdingBooking = (list: Booking[], tableId: string, now: number) =>
  bookingsFor(list, tableId).find((b) => bookingState(b, now) !== "upcoming");

/** Other bookings on the same table within MIN_GAP_MIN of `at`. */
export function clashes(list: Booking[], tableId: string, at: string, ignoreId?: string) {
  const t = bookingTime({ at });
  return list.filter((b) => b.tableId === tableId && b.id !== ignoreId && Math.abs(bookingTime(b) - t) < MIN_GAP_MIN * MIN);
}

/** A booking this far past its time is a no-show nobody cleared; it no longer belongs on the floor. */
export const STALE_AFTER_MIN = 12 * 60;

export const pruneStaleBookings = (list: Booking[], now: number) => list.filter((b) => now - bookingTime(b) < STALE_AFTER_MIN * MIN);

/** Bookings whose time falls on the same calendar day as `now`. */
export const bookingsOnDay = (list: Booking[], now: number) => {
  const day = new Date(now).toDateString();
  return list.filter((b) => new Date(bookingTime(b)).toDateString() === day);
};
