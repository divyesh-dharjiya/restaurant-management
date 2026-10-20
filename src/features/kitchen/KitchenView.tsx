"use client";

import { AnimatePresence } from "motion/react";
import { ChefHat } from "lucide-react";
import type { TicketStatus } from "@/types/pos";
import { cn } from "@/lib/cn";
import { elapsed } from "@/lib/format";
import { useNow } from "@/hooks/useNow";
import { useAppSelector, useIsClient } from "@/store/hooks";
import { selectTickets } from "@/store/selectors";
import { EmptyState, PageHeader } from "@/components/ui";
import { TicketCard } from "./TicketCard";

const COLUMNS: { status: TicketStatus; title: string; dot: string }[] = [
  { status: "new", title: "New", dot: "bg-sky-500" },
  { status: "preparing", title: "Cooking", dot: "bg-accent-500" },
  { status: "ready", title: "Ready to serve", dot: "bg-emerald-500" },
];

/** Kitchen display: tickets flow left to right; oldest first in each column. */
export function KitchenView() {
  const tickets = useAppSelector(selectTickets);
  const isClient = useIsClient();
  const now = useNow(15_000);
  const active = tickets.filter((t) => t.status !== "served");
  const served = tickets.filter((t) => t.status === "served").slice(-8).reverse();

  return (
    <div className="space-y-6">
      <PageHeader title="Kitchen" subtitle={`${active.length} open ${active.length === 1 ? "ticket" : "tickets"} · updates live from every till on this device`} />

      {isClient && !active.length ? (
        <EmptyState icon={ChefHat} title="No open kitchen tickets">Send an order to the kitchen from a table and it appears here.</EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((col) => {
            const list = active.filter((t) => t.status === col.status).sort((a, b) => a.createdAt - b.createdAt);
            return (
              <section key={col.status} aria-labelledby={`col-${col.status}`} className="min-w-0 rounded-3xl bg-surface-2/60 p-3">
                <h2 id={`col-${col.status}`} className="mb-3 flex items-center gap-2 px-1 font-bold">
                  <span className={cn("size-2 rounded-full", col.dot)} /> {col.title}
                  <span className="rounded-full bg-surface px-2 text-xs tabular-nums text-muted">{list.length}</span>
                </h2>
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {list.map((t) => <TicketCard key={t.id} ticket={t} now={now} />)}
                  </AnimatePresence>
                  {!list.length && <p className="px-1 py-6 text-center text-sm text-subtle">Nothing here</p>}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {served.length > 0 && (
        <section aria-labelledby="served-h">
          <h2 id="served-h" className="mb-2 text-sm font-semibold text-muted">Recently served</h2>
          <ul className="flex flex-wrap gap-2 text-sm">
            {served.map((t) => (
              <li key={t.id} className="rounded-xl border border-line bg-surface px-3 py-1.5 text-muted">
                <span className="font-semibold text-fg">{t.tableName}</span> · {t.number} · {elapsed(t.createdAt, now)} ago
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
