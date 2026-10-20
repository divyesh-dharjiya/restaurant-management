"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, SearchX } from "lucide-react";
import type { TableStatus } from "@/types/pos";
import { useNow } from "@/hooks/useNow";
import { useAppSelector, useIsClient } from "@/store/hooks";
import { selectPos, tableStatus } from "@/store/selectors";
import { bookingsFor } from "@/lib/reservations";
import { EmptyState, PageHeader, Segmented } from "@/components/ui";
import { FloorStats } from "./FloorStats";
import { ReservationStrip } from "./ReservationStrip";
import { TableCard } from "./TableCard";
import { TableSheet } from "./TableSheet";
import { TableForm } from "./TableForm";

type StatusFilter = "all" | "free" | "reserved" | "busy";
const STATUS_FILTERS: { id: StatusFilter; label: string; match: (s: TableStatus) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "free", label: "Available", match: (s) => s === "free" },
  { id: "reserved", label: "Reserved", match: (s) => s === "reserved" },
  { id: "busy", label: "Occupied", match: (s) => s === "seated" || s === "ordering" || s === "billing" },
];

/** Cards animate in on the first visit only; returning to the floor should feel instant. */
let floorSeen = false;

export function FloorView() {
  const { tables, sessions, bookings } = useAppSelector(selectPos);
  const isClient = useIsClient();
  const now = useNow();
  const [zone, setZone] = useState("All");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState<{ open: boolean; editId?: string | null }>({ open: false });
  // Server HTML must render cards visible; animate only when arriving by client-side navigation.
  const [animateIn] = useState(() => !floorSeen && isClient);
  useEffect(() => {
    floorSeen = true;
  }, []);

  const zones = useMemo(() => ["All", ...new Set(tables.map((t) => t.zone))].map((z) => ({ id: z, label: z })), [tables]);
  const match = STATUS_FILTERS.find((f) => f.id === filter)!.match;
  const visible = tables
    .map((t) => ({ table: t, status: tableStatus({ sessions, bookings }, t.id, now) }))
    .filter(({ table, status }) => (zone === "All" || table.zone === zone) && match(status));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Floor"
        subtitle={isClient ? new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) : " "}
        actions={
          <button className="btn btn-primary" onClick={() => setForm({ open: true, editId: null })}>
            <Plus className="size-4" /> Add table
          </button>
        }
      />

      <FloorStats />
      <ReservationStrip now={now} onOpen={setOpenId} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented value={zone} onChange={setZone} options={zones} layoutId="zone-tab" label="Zone" wrap />
        <Segmented value={filter} onChange={setFilter} options={STATUS_FILTERS} layoutId="status-tab" label="Status" wrap />
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={SearchX} title="No tables match these filters" />
      ) : (
        <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" aria-label="Tables">
          {visible.map(({ table, status }, i) => (
            <TableCard key={table.id} index={i} animateIn={animateIn} table={table} status={status} session={sessions[table.id]} booking={bookingsFor(bookings, table.id)[0]} now={now} onOpen={() => setOpenId(table.id)} />
          ))}
        </section>
      )}

      <TableSheet tableId={openId} onClose={() => setOpenId(null)} onEdit={(id) => setForm({ open: true, editId: id })} />
      <TableForm open={form.open} editId={form.editId} onClose={() => setForm({ open: false })} />
    </div>
  );
}
