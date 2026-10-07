"use client";

import { motion } from "motion/react";
import { CalendarClock, Clock, Users } from "lucide-react";
import type { Booking, Session, Table, TableStatus } from "@/types/pos";
import { computeBill } from "@/lib/billing";
import { cn } from "@/lib/cn";
import { bookingTime, elapsed, money } from "@/lib/format";
import { StatusPill, statusTheme } from "@/components/ui";
import { TableIllustration } from "./TableIllustration";

type Props = { table: Table; status: TableStatus; session?: Session; booking?: Booking; now: number; index: number; onOpen: () => void };

export function TableCard({ table, status, session, booking, now, index, onOpen }: Props) {
  const totals = session && computeBill(session.cart, session.discountPct);
  const filled = session ? session.guests : booking ? booking.guests : 0;

  return (
    <motion.button
      layout="position"
      onClick={onOpen}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: Math.min(index, 12) * 0.035, type: "spring", bounce: 0.25, duration: 0.5 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={cn("card group relative flex flex-col overflow-hidden p-4 text-left transition-shadow hover:shadow-xl", statusTheme[status].ring, statusTheme[status].glow)}
      aria-label={`${table.name}, ${statusTheme[status].label}`}
    >
      {/* Status-tinted wash behind the illustration */}
      <span className={cn("pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-current to-transparent opacity-[0.07]", statusTheme[status].ink)} />

      <div className="relative flex w-full items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-bold tracking-tight">{table.name}</div>
          <div className="text-xs text-muted">{table.zone} · {table.seats} seats</div>
        </div>
        <StatusPill status={status} />
      </div>

      <TableIllustration name={table.name} seats={table.seats} filled={filled} status={status} className="relative mx-auto my-2 h-24 transition-transform duration-300 group-hover:scale-[1.04]" />

      <div className="relative mt-auto min-h-11 w-full border-t border-dashed border-line pt-2.5 text-sm">
        {session && totals ? (
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-wrap gap-x-3 text-xs text-muted">
              <span className="flex items-center gap-1"><Users className="size-3" />{session.guests}</span>
              <span className="flex items-center gap-1"><Clock className="size-3" />{elapsed(session.openedAt, now)}</span>
              {session.cart.length > 0 && <span>{totals.itemCount} items</span>}
            </div>
            <span className="font-extrabold tabular-nums">{session.cart.length ? money(totals.total) : "—"}</span>
          </div>
        ) : booking ? (
          <div className="flex items-center gap-2 text-xs">
            <CalendarClock className="size-3.5 shrink-0 text-violet-500" />
            <span className="min-w-0 truncate"><b className="font-semibold">{booking.name}</b> · {bookingTime(booking.at)}</span>
          </div>
        ) : (
          <span className="text-xs text-subtle group-hover:text-muted">Tap to seat, book or take an order</span>
        )}
      </div>
    </motion.button>
  );
}
