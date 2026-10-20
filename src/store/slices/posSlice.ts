import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import { computeBill } from "@/lib/billing";
import { seedTables } from "@/lib/catalog";
import { ymd } from "@/lib/format";
import type { Booking, PaymentMode, PosState, Table } from "@/types/pos";

export const initialState: PosState = { tables: seedTables, sessions: {}, bookings: [], bills: [], billSeq: 0, seedVersion: 0 };

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
    freeTable(state, { payload }: PayloadAction<string>) {
      delete state.sessions[payload];
    },
    moveTable(state, { payload }: PayloadAction<{ from: string; to: string }>) {
      const s = state.sessions[payload.from];
      if (!s || state.sessions[payload.to]) return;
      state.sessions[payload.to] = s;
      delete state.sessions[payload.from];
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
          tableName: state.tables.find((t) => t.id === payload.tableId)?.name ?? payload.tableId,
          guests: s.guests,
          createdAt: payload.at,
          payment: payload.payment,
          cart: s.cart,
          totals: computeBill(s.cart, s.discountPct),
        });
        delete state.sessions[payload.tableId];
      },
      prepare(tableId: string, payment: PaymentMode) {
        return { payload: { tableId, payment, id: nanoid(), at: Date.now() } };
      },
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
  seatTable, seatBooking, freeTable, moveTable, bookTable, cancelBooking, addTable, updateTable, removeTable, settleBill, removeDemoBills, archiveBills,
} = posSlice.actions;

export default posSlice.reducer;
