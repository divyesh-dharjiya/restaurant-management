"use client";

import { useRouter } from "next/navigation";
import { CalendarClock, Clock, DoorOpen, Pencil, Phone, ReceiptText, Trash2, UserCheck, Users, Utensils, X } from "lucide-react";
import { computeBill } from "@/lib/billing";
import { bookingTime, elapsed, money } from "@/lib/format";
import { useNow } from "@/hooks/useNow";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectBooking, selectSession } from "@/store/selectors";
import { cancelBooking, freeTable, removeTable, seatTable } from "@/store/slices/posSlice";

type Props = { tableId: string; onBook: () => void; onSeat: () => void; onEdit: () => void; onClose: () => void };

export function TableOverview({ tableId, onBook, onSeat, onEdit, onClose }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const session = useAppSelector(selectSession(tableId));
  const booking = useAppSelector(selectBooking(tableId));
  const now = useNow();
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
          <div className="mt-3 text-xs text-muted">{totals.itemCount} items</div>
          <div className="text-2xl font-extrabold tabular-nums">{money(totals.total)}</div>
        </section>
      )}

      {booking && (
        <section className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">Reservation</div>
          <div className="mt-1 font-semibold">{booking.name}</div>
          <div className="mt-1 space-y-0.5 text-sm text-muted">
            <div className="flex items-center gap-1.5"><CalendarClock className="size-3.5" />{bookingTime(booking.at)}</div>
            <div className="flex items-center gap-1.5"><Users className="size-3.5" />{booking.guests} guests</div>
            {booking.phone && <a href={`tel:${booking.phone}`} className="flex items-center gap-1.5 hover:text-fg"><Phone className="size-3.5" />{booking.phone}</a>}
            {booking.note && <p className="pt-1 italic">“{booking.note}”</p>}
          </div>
          <div className="mt-3 flex gap-2">
            {!session && (
              <button className="btn btn-primary flex-1" onClick={() => dispatch(seatTable({ tableId }))}>
                <UserCheck className="size-4" /> Guests arrived
              </button>
            )}
            <button className="btn btn-ghost flex-1" onClick={() => dispatch(cancelBooking(tableId))}>
              <X className="size-4" /> Cancel booking
            </button>
          </div>
        </section>
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
            <button
              className="btn btn-danger h-12"
              onClick={() => {
                if (session.cart.length && !confirm("This table has unbilled items. Free it anyway?")) return;
                dispatch(freeTable(tableId));
              }}
            >
              <DoorOpen className="size-4" /> Free table
            </button>
            {!booking && (
              <button className="btn btn-ghost h-12" onClick={onBook}>
                <CalendarClock className="size-4" /> Book for later
              </button>
            )}
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
            {!booking && (
              <div className="grid grid-cols-2 gap-2">
                <button className="btn btn-ghost h-12" onClick={onSeat}><UserCheck className="size-4" /> Seat walk-in</button>
                <button className="btn btn-ghost h-12" onClick={onBook}><CalendarClock className="size-4" /> Book table</button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
        <button onClick={onEdit} className="flex items-center gap-1.5 text-muted hover:text-fg"><Pencil className="size-3.5" /> Edit table</button>
        <button
          disabled={!!session}
          title={session ? "Free the table first" : undefined}
          onClick={() => {
            if (!confirm(booking ? "Remove this table and its reservation?" : "Remove this table from the floor?")) return;
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
