"use client";

import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/cn";
import { bookingTime as fmtBookingTime } from "@/lib/format";
import { bookingState, sortByTime } from "@/lib/reservations";
import { useAppSelector } from "@/store/hooks";
import { selectBookings, selectTables } from "@/store/selectors";
import { BookingStateChip } from "./BookingCard";

/** Next reservations, soonest first; late ones (possible no-shows) stand out. */
export function ReservationStrip({ now, onOpen }: { now: number; onOpen: (tableId: string) => void }) {
  const bookings = useAppSelector(selectBookings);
  const tables = useAppSelector(selectTables);
  const list = sortByTime(bookings).slice(0, 10);
  if (!list.length) return null;

  return (
    <section aria-labelledby="upcoming-h">
      <h2 id="upcoming-h" className="mb-2 text-sm font-semibold text-muted">Reservations</h2>
      <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {list.map((b) => {
          const late = bookingState(b, now) === "late";
          return (
            <button
              key={b.id}
              onClick={() => onOpen(b.tableId)}
              className={cn("card flex shrink-0 items-center gap-3 px-4 py-3 text-left transition", late ? "border-rose-500/40 hover:border-rose-500/70" : "hover:border-violet-500/50")}
            >
              <span className={cn("grid size-9 place-items-center rounded-xl", late ? "bg-rose-500/10 text-rose-600 dark:text-rose-300" : "bg-violet-500/10 text-violet-600 dark:text-violet-300")}>
                <CalendarClock className="size-4" />
              </span>
              <span className="text-sm">
                <span className="flex items-center gap-2 font-semibold">
                  {b.name} · {b.guests}p <BookingStateChip booking={b} now={now} />
                </span>
                <span className="block text-xs text-muted">{tables.find((t) => t.id === b.tableId)?.name} · {fmtBookingTime(b.at)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
