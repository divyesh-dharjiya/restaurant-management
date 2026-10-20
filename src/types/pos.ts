import type { BillTotals, CartLine } from "@/lib/billing";

export type PaymentMode = "Cash" | "UPI" | "Card";

export type Table = { id: string; name: string; seats: number; zone: string };

/** A table that currently has guests sitting at it (with or without items ordered). */
export type Session = {
  cart: CartLine[];
  guests: number;
  guestName?: string;
  discountPct: number;
  openedAt: number;
  billRequested: boolean;
};

export type Booking = {
  id: string;
  tableId: string;
  name: string;
  phone: string;
  guests: number;
  /** Local date-time string from <input type="datetime-local">. */
  at: string;
  note?: string;
  createdAt: number;
};

/** Where a reservation stands relative to now. */
export type BookingState = "upcoming" | "due" | "late";

export type Bill = {
  id: string;
  number: string;
  tableId: string;
  tableName: string;
  guests: number;
  createdAt: number;
  payment: PaymentMode;
  cart: CartLine[];
  totals: BillTotals;
  /** Sample data generated for the demo dashboard. */
  demo?: boolean;
};

export type TableStatus = "free" | "reserved" | "seated" | "ordering" | "billing";

export type PosState = {
  tables: Table[];
  sessions: Record<string, Session>;
  /** All reservations; a table can have several (lunch + dinner). */
  bookings: Booking[];
  bills: Bill[];
  billSeq: number;
  /** Bumped when sample data is added so it is only seeded once per browser. */
  seedVersion: number;
};
