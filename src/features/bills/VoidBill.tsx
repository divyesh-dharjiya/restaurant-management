"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import type { Bill } from "@/types/pos";
import { dateTime } from "@/lib/format";
import { useAppDispatch } from "@/store/hooks";
import { voidBill } from "@/store/slices/posSlice";

const REASONS = ["Wrong table", "Billed twice", "Refunded", "Test bill"];

/** Void control for a settled bill, or the void record once voided. */
export function VoidBill({ bill }: { bill: Bill }) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (bill.voided) {
    return (
      <p role="status" className="flex items-start gap-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-800 dark:text-rose-200">
        <Ban className="mt-0.5 size-4 shrink-0" />
        <span>Voided {dateTime(bill.voided.at)}: {bill.voided.reason}. Not counted in sales.</span>
      </p>
    );
  }

  if (!open) {
    return (
      <button className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400" onClick={() => setOpen(true)}>
        <Ban className="size-4" /> Void this bill
      </button>
    );
  }

  return (
    <form
      className="space-y-3 rounded-2xl border border-rose-500/30 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!reason.trim()) return;
        dispatch(voidBill(bill.id, reason));
        setOpen(false);
      }}
    >
      <p className="text-sm text-muted">A voided bill stays on record with its number, but is removed from sales and GST totals.</p>
      <div className="flex flex-wrap gap-1.5">
        {REASONS.map((r) => (
          <button key={r} type="button" onClick={() => setReason(r)} aria-pressed={reason === r} className="rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-muted aria-pressed:border-rose-500/50 aria-pressed:bg-rose-500/10 aria-pressed:text-rose-700 dark:aria-pressed:text-rose-300">
            {r}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="sr-only">Reason</span>
        <input value={reason} onChange={(e) => setReason(e.target.value)} required maxLength={120} placeholder="Reason (required)" className="field" />
      </label>
      <div className="flex gap-2">
        <button type="button" className="btn btn-ghost flex-1" onClick={() => setOpen(false)}>Keep bill</button>
        <button className="btn btn-danger flex-1" disabled={!reason.trim()}>Void bill</button>
      </div>
    </form>
  );
}
