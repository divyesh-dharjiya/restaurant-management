import type { PosState, TableStatus } from "@/types/pos";
import { holdingBooking } from "@/lib/reservations";
import type { RootState } from "./store";

export const selectPos = (s: RootState) => s.pos;
export const selectTables = (s: RootState) => s.pos.tables;
export const selectSessions = (s: RootState) => s.pos.sessions;
export const selectBookings = (s: RootState) => s.pos.bookings;
export const selectBills = (s: RootState) => s.pos.bills;
export const selectSession = (id: string) => (s: RootState) => s.pos.sessions[id];
export const selectTable = (id: string) => (s: RootState) => s.pos.tables.find((t) => t.id === id);
export const selectActiveCount = (s: RootState) => Object.keys(s.pos.sessions).length;

/**
 * Guests at the table win; otherwise the table is "reserved" only while a booking
 * is due or late. Bookings later in the day leave it available for walk-ins.
 */
export function tableStatus(s: Pick<PosState, "sessions" | "bookings">, id: string, now: number): TableStatus {
  const session = s.sessions[id];
  if (session) return session.billRequested ? "billing" : session.cart.length ? "ordering" : "seated";
  return holdingBooking(s.bookings, id, now) ? "reserved" : "free";
}
