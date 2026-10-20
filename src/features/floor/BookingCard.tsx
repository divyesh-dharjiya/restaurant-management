"use client";

import { CalendarClock, Phone, UserCheck, Users, X } from "lucide-react";
import type { Booking } from "@/types/pos";
import { cn } from "@/lib/cn";
import { elapsed, bookingTime as fmtBookingTime } from "@/lib/format";
import { bookingState, bookingTime } from "@/lib/reservations";

/** Small chip describing where a booking stands right now. */
export function BookingStateChip({ booking, now }: { booking: Booking; now: number }) {
  const state = bookingState(booking, now);
  if (state === "late") {
    return <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300">Late {elapsed(bookingTime(booking), now)}</span>;
  }
  if (state === "due") return <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300">Due now</span>;
  return <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">Upcoming</span>;
}

type Props = { booking: Booking; now: number; canSeat: boolean; onArrived: () => void; onCancel: () => void };

export function BookingCard({ booking, now, canSeat, onArrived, onCancel }: Props) {
  const late = bookingState(booking, now) === "late";
  return (
    <section className={cn("rounded-2xl border p-4", late ? "border-rose-500/30 bg-rose-500/5" : "border-violet-500/30 bg-violet-500/5")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-semibold">{booking.name}</div>
          <div className="mt-1 space-y-0.5 text-sm text-muted">
            <div className="flex items-center gap-1.5"><CalendarClock className="size-3.5" />{fmtBookingTime(booking.at)}</div>
            <div className="flex items-center gap-1.5"><Users className="size-3.5" />{booking.guests} guests</div>
            {booking.phone && (
              <a href={`tel:${booking.phone}`} className="flex items-center gap-1.5 hover:text-fg"><Phone className="size-3.5" />{booking.phone}</a>
            )}
            {booking.note && <p className="pt-1 italic">“{booking.note}”</p>}
          </div>
        </div>
        <BookingStateChip booking={booking} now={now} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="btn btn-primary" disabled={!canSeat} title={canSeat ? undefined : "Free the table first"} onClick={onArrived}>
          <UserCheck className="size-4" /> Arrived
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>
          <X className="size-4" /> {late ? "No-show" : "Cancel"}
        </button>
      </div>
    </section>
  );
}
