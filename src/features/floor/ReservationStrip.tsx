"use client";

import { CalendarClock } from "lucide-react";
import { bookingTime } from "@/lib/format";
import { useAppSelector } from "@/store/hooks";
import { selectBookings, selectTables } from "@/store/selectors";

/** Horizontal list of the next few reservations, soonest first. */
export function ReservationStrip({ onOpen }: { onOpen: (tableId: string) => void }) {
  const bookings = useAppSelector(selectBookings);
  const tables = useAppSelector(selectTables);
  const upcoming = Object.entries(bookings)
    .sort(([, a], [, b]) => a.at.localeCompare(b.at))
    .slice(0, 8);

  if (!upcoming.length) return null;
  return (
    <section aria-labelledby="upcoming-h">
      <h2 id="upcoming-h" className="mb-2 text-sm font-semibold text-muted">Upcoming reservations</h2>
      <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {upcoming.map(([tid, b]) => (
          <button key={tid} onClick={() => onOpen(tid)} className="card flex shrink-0 items-center gap-3 px-4 py-3 text-left transition hover:border-violet-500/50">
            <span className="grid size-9 place-items-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
              <CalendarClock className="size-4" />
            </span>
            <span className="text-sm">
              <span className="block font-semibold">{b.name} · {b.guests} guests</span>
              <span className="block text-xs text-muted">{tables.find((t) => t.id === tid)?.name} · {bookingTime(b.at)}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
