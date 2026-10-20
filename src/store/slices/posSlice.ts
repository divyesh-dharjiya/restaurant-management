import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import { computeBill } from "@/lib/billing";
import { seedTables } from "@/lib/catalog";
import { ymd } from "@/lib/format";
import { nextStatus, pendingLines, pruneTickets, sentSnapshot } from "@/lib/kitchen";
import type { Booking, PaymentMode, PosState, Table, TicketStatus } from "@/types/pos";

export const initialState: PosState = { tables: seedTables, sessions: {}, bookings: [], bills: [], billSeq: 0, tickets: [], kotSeq: 0, soldOut: [], seedVersion: 0 };

const tableName = (state: PosState, id: string) => state.tables.find((t) => t.id === id)?.name ?? id;

/**
 * Seat guests at a table. Never touches reservations: a walk-in can use a table
 * before tonight's booking, and the booking stays. Use `seatBooking` when a
 * booked party arrives.
 */
function seat(state: PosState, tableId: string, guests?: number, guestName?: string) {
  if (state.sessions[tableId]) return state.sessions[tableId];
  return (state.sessions[tableId] = {
    cart: [],
    guests: guests ?? 2,
    guestName,
    discountPct: 0,
    openedAt: Date.now(),
    billRequested: false,
  });
}

type TI = { tableId: string; itemId: string };

const posSlice = createSlice({
  name: "pos",
  initialState,
  reducers: {
    /** Replace state wholesale (cross-tab sync). */
    replace: (_s, { payload }: PayloadAction<PosState>) => payload,

    // ── Orders ────────────────────────────────────────────
    addItem(state, { payload }: PayloadAction<TI>) {
      if (state.soldOut.includes(payload.itemId)) return;
      const s = seat(state, payload.tableId);
      s.billRequested = false;
      const line = s.cart.find((l) => l.itemId === payload.itemId);
      if (line) line.qty++;
      else s.cart.push({ itemId: payload.itemId, qty: 1 });
    },
    decItem(state, { payload }: PayloadAction<TI>) {
      const s = state.sessions[payload.tableId];
      const line = s?.cart.find((l) => l.itemId === payload.itemId);
      if (!s || !line) return;
      if (--line.qty <= 0) s.cart = s.cart.filter((l) => l !== line);
    },
    removeItem(state, { payload }: PayloadAction<TI>) {
      const s = state.sessions[payload.tableId];
      if (s) s.cart = s.cart.filter((l) => l.itemId !== payload.itemId);
    },
    clearCart(state, { payload }: PayloadAction<string>) {
      const s = state.sessions[payload];
      if (s) Object.assign(s, { cart: [], billRequested: false });
    },
    setNote(state, { payload }: PayloadAction<TI & { note: string }>) {
      const line = state.sessions[payload.tableId]?.cart.find((l) => l.itemId === payload.itemId);
      if (line) line.note = payload.note || undefined;
    },
    setGuests(state, { payload }: PayloadAction<{ tableId: string; guests: number }>) {
      seat(state, payload.tableId).guests = Math.min(50, Math.max(1, payload.guests));
    },
    setDiscount(state, { payload }: PayloadAction<{ tableId: string; pct: number }>) {
      const s = state.sessions[payload.tableId];
      if (s) s.discountPct = Math.min(100, Math.max(0, payload.pct || 0));
    },
    requestBill(state, { payload }: PayloadAction<string>) {
      const s = state.sessions[payload];
      if (s?.cart.length) s.billRequested = true;
    },
    reopenTable(state, { payload }: PayloadAction<string>) {
      const s = state.sessions[payload];
      if (s) s.billRequested = false;
    },

    // ── Table lifecycle ───────────────────────────────────
    seatTable(state, { payload }: PayloadAction<{ tableId: string; guests?: number; guestName?: string }>) {
      seat(state, payload.tableId, payload.guests, payload.guestName);
    },
    /** Guests left without a bill: the order is abandoned, so its open tickets leave the kitchen too. */
    freeTable(state, { payload }: PayloadAction<string>) {
      delete state.sessions[payload];
      state.tickets = state.tickets.filter((t) => t.tableId !== payload || t.status === "served");
    },
    moveTable(state, { payload }: PayloadAction<{ from: string; to: string }>) {
      const s = state.sessions[payload.from];
      if (!s || state.sessions[payload.to]) return;
      state.sessions[payload.to] = s;
      delete state.sessions[payload.from];
      for (const t of state.tickets) if (t.tableId === payload.from && t.status !== "served") Object.assign(t, { tableId: payload.to, tableName: tableName(state, payload.to) });
    },
    bookTable: {
      reducer(state, { payload }: PayloadAction<Booking>) {
        state.bookings.push(payload);
      },
      prepare(booking: Omit<Booking, "id" | "createdAt">) {
        return { payload: { ...booking, id: nanoid(), createdAt: Date.now() } };
      },
    },
    /** The booked party has arrived: seat them and close that one booking. */
    seatBooking(state, { payload }: PayloadAction<string>) {
      const b = state.bookings.find((x) => x.id === payload);
      if (!b || state.sessions[b.tableId]) return;
      seat(state, b.tableId, b.guests, b.name);
      state.bookings = state.bookings.filter((x) => x.id !== payload);
    },
    /** Cancel or mark as no-show. */
    cancelBooking(state, { payload }: PayloadAction<string>) {
      state.bookings = state.bookings.filter((b) => b.id !== payload);
    },

    // ── Floor management ──────────────────────────────────
    addTable: {
      reducer(state, { payload }: PayloadAction<Table>) {
        state.tables.push(payload);
      },
      prepare(t: Omit<Table, "id">) {
        return { payload: { ...t, id: `T-${nanoid(6)}` } };
      },
    },
    updateTable(state, { payload }: PayloadAction<Table>) {
      const i = state.tables.findIndex((t) => t.id === payload.id);
      if (i >= 0) state.tables[i] = payload;
    },
    removeTable(state, { payload }: PayloadAction<string>) {
      if (state.sessions[payload]) return; // never drop a table with guests on it
      state.tables = state.tables.filter((t) => t.id !== payload);
      state.bookings = state.bookings.filter((b) => b.tableId !== payload);
    },

    // ── Billing ───────────────────────────────────────────
    settleBill: {
      reducer(state, { payload }: PayloadAction<{ tableId: string; payment: PaymentMode; id: string; at: number }>) {
        const s = state.sessions[payload.tableId];
        if (!s?.cart.length) return;
        state.billSeq++;
        state.bills.unshift({
          id: payload.id,
          number: `INV-${ymd(new Date(payload.at))}-${String(state.billSeq).padStart(4, "0")}`,
          tableId: payload.tableId,
          tableName: tableName(state, payload.tableId),
          guests: s.guests,
          createdAt: payload.at,
          payment: payload.payment,
          cart: s.cart,
          totals: computeBill(s.cart, s.discountPct),
        });
        delete state.sessions[payload.tableId];
        for (const t of state.tickets) if (t.tableId === payload.tableId) t.status = "served";
      },
      prepare(tableId: string, payment: PaymentMode) {
        return { payload: { tableId, payment, id: nanoid(), at: Date.now() } };
      },
    },
    /** Cancel a settled bill. It stays on record (numbering has no gaps) but leaves sales figures. */
    voidBill: {
      reducer(state, { payload }: PayloadAction<{ id: string; reason: string; at: number }>) {
        const b = state.bills.find((x) => x.id === payload.id);
        if (b && !b.voided) b.voided = { at: payload.at, reason: payload.reason.trim() || "No reason given" };
      },
      prepare(id: string, reason: string) {
        return { payload: { id, reason, at: Date.now() } };
      },
    },

    // ── Kitchen ───────────────────────────────────────────
    sendToKitchen: {
      reducer(state, { payload }: PayloadAction<{ tableId: string; id: string; at: number }>) {
        const s = state.sessions[payload.tableId];
        if (!s) return;
        const lines = pendingLines(s);
        if (!lines.length) return;
        state.kotSeq++;
        state.tickets = pruneTickets(state.tickets, payload.at);
        state.tickets.push({
          id: payload.id,
          number: `KOT-${String(state.kotSeq).padStart(4, "0")}`,
          tableId: payload.tableId,
          tableName: tableName(state, payload.tableId),
          createdAt: payload.at,
          status: "new",
          lines,
        });
        s.sent = sentSnapshot(s);
      },
      prepare(tableId: string) {
        return { payload: { tableId, id: nanoid(), at: Date.now() } };
      },
    },
    /** Move a ticket to a given status, or one step forward when none is given. */
    setTicketStatus(state, { payload }: PayloadAction<{ id: string; status?: TicketStatus }>) {
      const t = state.tickets.find((x) => x.id === payload.id);
      if (t) t.status = payload.status ?? nextStatus(t.status);
    },
    toggleSoldOut(state, { payload }: PayloadAction<string>) {
      state.soldOut = state.soldOut.includes(payload) ? state.soldOut.filter((id) => id !== payload) : [...state.soldOut, payload];
    },

    removeDemoBills(state) {
      state.bills = state.bills.filter((b) => !b.demo);
    },
    /** Drop bills created before `before` (after they have been downloaded). */
    archiveBills(state, { payload }: PayloadAction<{ before: number }>) {
      state.bills = state.bills.filter((b) => b.createdAt >= payload.before);
    },
  },
});

export const {
  replace, addItem, decItem, removeItem, clearCart, setNote, setGuests, setDiscount, requestBill, reopenTable,
  seatTable, seatBooking, freeTable, moveTable, bookTable, cancelBooking, addTable, updateTable, removeTable, settleBill, voidBill, sendToKitchen, setTicketStatus, toggleSoldOut, removeDemoBills, archiveBills,
} = posSlice.actions;

export default posSlice.reducer;
