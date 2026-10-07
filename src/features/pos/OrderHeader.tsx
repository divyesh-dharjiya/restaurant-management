"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRightLeft, Users } from "lucide-react";
import type { Table } from "@/types/pos";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectPos, tableStatus } from "@/store/selectors";
import { moveTable, setGuests } from "@/store/slices/posSlice";
import { StatusPill, Stepper } from "@/components/ui";

export function OrderHeader({ table }: { table: Table }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { tables, sessions, bookings } = useAppSelector(selectPos);
  const id = table.id;
  const session = sessions[id];
  const guests = session?.guests ?? bookings[id]?.guests ?? 2;
  const freeTables = tables.filter((t) => t.id !== id && !sessions[t.id] && !bookings[t.id]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/" className="grid size-10 place-items-center rounded-xl border border-line bg-surface hover:bg-surface-2" aria-label="Back to floor">
        <ArrowLeft className="size-4" />
      </Link>
      <div className="mr-auto">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">{table.name}</h1>
          <StatusPill status={tableStatus({ sessions, bookings }, id)} />
        </div>
        <p className="text-xs text-muted">{table.zone} · {table.seats} seats{session?.guestName && ` · ${session.guestName}`}</p>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-1.5 text-sm text-muted">
        <Users className="size-4" />
        <Stepper size="sm" qty={guests} label="Guests" onInc={() => dispatch(setGuests({ tableId: id, guests: guests + 1 }))} onDec={() => dispatch(setGuests({ tableId: id, guests: guests - 1 }))} />
      </div>
      {session && freeTables.length > 0 && (
        <label className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm text-muted">
          <ArrowRightLeft className="size-4" />
          <select
            value=""
            aria-label="Move order to another table"
            onChange={(e) => {
              dispatch(moveTable({ from: id, to: e.target.value }));
              router.replace(`/table/${e.target.value}`);
            }}
            className="bg-transparent text-fg outline-none"
          >
            <option value="" disabled>Move to…</option>
            {freeTables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      )}
    </div>
  );
}
