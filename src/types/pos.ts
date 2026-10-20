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
  /** Quantity of each dish already sent to the kitchen (KOT), by item id. */
  sent?: Record<string, number>;
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
  /** Cancelled after settling (wrong table, refund). Kept for the audit trail, left out of sales. */
  voided?: { at: number; reason: string };
};

export type TicketStatus = "new" | "preparing" | "ready" | "served";

/** One kitchen order ticket (KOT). A negative qty is a cancellation of something already sent. */
export type KitchenTicket = {
  id: string;
  number: string;
  tableId: string;
  tableName: string;
  createdAt: number;
  status: TicketStatus;
  lines: { itemId: string; name: string; qty: number; note?: string }[];
};

export type TableStatus = "free" | "reserved" | "seated" | "ordering" | "billing";

export type PosState = {
  tables: Table[];
  sessions: Record<string, Session>;
  /** All reservations; a table can have several (lunch + dinner). */
  bookings: Booking[];
  bills: Bill[];
  billSeq: number;
  /** Kitchen tickets for today's service. Served tickets are pruned after a day. */
  tickets: KitchenTicket[];
  kotSeq: number;
  /** Dishes marked unavailable (86'd) for now. */
  soldOut: string[];
  /** Bumped when sample data is added so it is only seeded once per browser. */
  seedVersion: number;
};
