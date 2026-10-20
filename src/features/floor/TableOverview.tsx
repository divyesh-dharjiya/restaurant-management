"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock, Clock, DoorOpen, Pencil, ReceiptText, Trash2, UserCheck, Users, Utensils } from "lucide-react";
import { computeBill } from "@/lib/billing";
import { bookingTime as fmtBookingTime, elapsed, money } from "@/lib/format";
import { bookingsFor, bookingState } from "@/lib/reservations";
import { useNow } from "@/hooks/useNow";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectBookings, selectSession } from "@/store/selectors";
import { cancelBooking, freeTable, removeTable, seatBooking, seatTable } from "@/store/slices/posSlice";
import { BookingCard } from "./BookingCard";

type Props = { tableId: string; onBook: () => void; onSeat: () => void; onEdit: () => void; onClose: () => void };

export function TableOverview({ tableId, onBook, onSeat, onEdit, onClose }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const session = useAppSelector(selectSession(tableId));
  const allBookings = useAppSelector(selectBookings);
  const now = useNow();
  const bookings = bookingsFor(allBookings, tableId);
  const soon = bookings.find((b) => bookingState(b, now) !== "upcoming");
  const totals = session && computeBill(session.cart, session.discountPct);

  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="space-y-4">
      {session && totals && (
        <section className="rounded-2xl bg-surface-2 p-4">
          <div className="flex items-center justify-between text-sm text-muted">
            <span className="flex items-center gap-1.5"><Users className="size-4" />{session.guests} guests{session.guestName && ` · ${session.guestName}`}</span>
            <span className="flex items-center gap-1.5"><Clock className="size-4" />{elapsed(session.openedAt, now)}</span>
          </div>
          <div className="mt-3 text-xs text-muted">{totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}</div>
          <div className="text-2xl font-extrabold tabular-nums">{money(totals.total)}</div>
        </section>
      )}

      {/* Walk-ins are allowed before a booking — just make the clash visible. */}
      {!session && soon && (
        <p className="flex items-start gap-2 rounded-xl bg-accent-soft p-3 text-sm text-accent-700 dark:text-accent-400">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span><b>{soon.name}</b> is booked for {fmtBookingTime(soon.at)}. Seating someone else now may clash.</span>
        </p>
      )}

      <div className="grid gap-2">
        {session ? (
          <>
            <button className="btn btn-primary h-12" onClick={() => go(`/table/${tableId}`)}>
              <Utensils className="size-4" /> {session.cart.length ? "Open order" : "Take order"}
            </button>
            {session.cart.length > 0 && (
              <button className="btn btn-ghost h-12" onClick={() => go(`/table/${tableId}/bill`)}>
                <ReceiptText className="size-4" /> Generate bill
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                className="btn btn-danger h-12"
                onClick={() => {
                  if (session.cart.length && !confirm("This table has unbilled items. Free it anyway?")) return;
                  dispatch(freeTable(tableId));
                }}
              >
                <DoorOpen className="size-4" /> Free table
              </button>
              <button className="btn btn-ghost h-12" onClick={onBook}><CalendarClock className="size-4" /> Book later</button>
            </div>
          </>
        ) : (
          <>
            <button
              className="btn btn-primary h-12"
              onClick={() => {
                dispatch(seatTable({ tableId }));
                go(`/table/${tableId}`);
              }}
            >
              <Utensils className="size-4" /> Take order now
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn btn-ghost h-12" onClick={onSeat}><UserCheck className="size-4" /> Seat walk-in</button>
              <button className="btn btn-ghost h-12" onClick={onBook}><CalendarClock className="size-4" /> Book table</button>
            </div>
          </>
        )}
      </div>

      {bookings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Reservations ({bookings.length})</h3>
          {bookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              now={now}
              canSeat={!session}
              onArrived={() => dispatch(seatBooking(b.id))}
              onCancel={() => confirm(`Remove ${b.name}'s booking?`) && dispatch(cancelBooking(b.id))}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
        <button onClick={onEdit} className="flex items-center gap-1.5 text-muted hover:text-fg"><Pencil className="size-3.5" /> Edit table</button>
        <button
          disabled={!!session}
          title={session ? "Free the table first" : undefined}
          onClick={() => {
            const msg = bookings.length ? `Remove this table and its ${bookings.length} reservation(s)?` : "Remove this table from the floor?";
            if (!confirm(msg)) return;
            dispatch(removeTable(tableId));
            onClose();
          }}
          className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-rose-400"
        >
          <Trash2 className="size-3.5" /> Remove table
        </button>
      </div>
    </div>
  );
}
