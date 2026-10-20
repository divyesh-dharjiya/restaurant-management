"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { ArrowRight, Clock, Printer, Undo2 } from "lucide-react";
import type { KitchenTicket, TicketStatus } from "@/types/pos";
import { cn } from "@/lib/cn";
import { elapsed } from "@/lib/format";
import { printElement } from "@/lib/print";
import { useAppDispatch } from "@/store/hooks";
import { setTicketStatus } from "@/store/slices/posSlice";
import { KotSlip } from "./KotSlip";

const ACTION: Record<TicketStatus, string> = { new: "Start cooking", preparing: "Mark ready", ready: "Served", served: "" };
const BACK: Partial<Record<TicketStatus, TicketStatus>> = { preparing: "new", ready: "preparing" };

/** Tickets waiting longer than this are highlighted so nothing is forgotten. */
const SLOW_MS = 15 * 60_000;

export function TicketCard({ ticket, now }: { ticket: KitchenTicket; now: number }) {
  const dispatch = useAppDispatch();
  const slipRef = useRef<HTMLDivElement>(null);
  const slow = ticket.status !== "ready" && now - ticket.createdAt > SLOW_MS;
  const back = BACK[ticket.status];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn("card overflow-hidden", slow && "border-rose-500/50 ring-1 ring-rose-500/30")}
      aria-label={`${ticket.number}, ${ticket.tableName}`}
    >
      <header className="flex items-center justify-between gap-2 border-b border-line bg-surface-2/60 px-4 py-2.5">
        <div className="min-w-0">
          <div className="truncate font-extrabold">{ticket.tableName}</div>
          <div className="font-mono text-[11px] text-muted">{ticket.number}</div>
        </div>
        <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", slow ? "bg-rose-500/10 text-rose-700 dark:text-rose-300" : "bg-surface text-muted")}>
          <Clock className="size-3" /> {elapsed(ticket.createdAt, now)}
        </span>
      </header>

      <ul className="space-y-1.5 px-4 py-3 text-sm">
        {ticket.lines.map((l) => (
          <li key={l.itemId}>
            <div className={cn("flex gap-2", l.qty < 0 && "text-rose-700 dark:text-rose-300")}>
              <span className="w-9 shrink-0 font-extrabold tabular-nums">{l.qty > 0 ? `${l.qty}×` : "✕"}</span>
              <span className={cn("font-semibold", l.qty < 0 && "line-through")}>{l.name}</span>
              {l.qty < 0 && <span className="ml-auto text-xs font-bold">cancel {-l.qty}</span>}
            </div>
            {l.note && <p className="ml-11 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-700 dark:text-accent-400">{l.note}</p>}
          </li>
        ))}
      </ul>

      <footer className="flex gap-2 border-t border-line p-3">
        {back && (
          <button className="btn btn-ghost size-10 shrink-0 p-0" onClick={() => dispatch(setTicketStatus({ id: ticket.id, status: back }))} aria-label={`Move ${ticket.number} back`} title="Move back">
            <Undo2 className="size-4" />
          </button>
        )}
        <button className="btn btn-ghost size-10 shrink-0 p-0" onClick={() => printElement(slipRef.current)} aria-label={`Print ${ticket.number}`} title="Print KOT">
          <Printer className="size-4" />
        </button>
        <button className="btn btn-primary h-10 flex-1" onClick={() => dispatch(setTicketStatus({ id: ticket.id }))}>
          {ACTION[ticket.status]} <ArrowRight className="size-4" />
        </button>
      </footer>
      {/* Off-screen copy used only for printing. */}
      <div className="hidden"><KotSlip ref={slipRef} ticket={ticket} /></div>
    </motion.article>
  );
}
