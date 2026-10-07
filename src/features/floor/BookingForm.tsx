"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import type { Booking } from "@/types/pos";
import { toLocalInput } from "@/lib/format";
import { useAppDispatch } from "@/store/hooks";
import { bookTable } from "@/store/slices/posSlice";
import { Field, Stepper } from "@/components/ui";

/** Next half hour + 1h — a sensible default reservation slot. */
function defaultSlot() {
  const d = new Date(Date.now() + 60 * 60_000);
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  return toLocalInput(d);
}

export function BookingForm({ tableId, seats, onDone }: { tableId: string; seats: number; onDone: () => void }) {
  const dispatch = useAppDispatch();
  const [guests, setGuests] = useState(Math.min(2, seats));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const booking: Booking = {
      name: String(f.get("name")).trim(),
      phone: String(f.get("phone")).trim(),
      at: String(f.get("at")),
      guests,
      note: String(f.get("note")).trim() || undefined,
    };
    dispatch(bookTable({ tableId, booking }));
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Guest name">
        <input name="name" required autoFocus autoComplete="off" className="field" placeholder="e.g. Priya Shah" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone">
          <input name="phone" type="tel" inputMode="tel" pattern="[0-9+\s\-]{7,15}" className="field" placeholder="98765 43210" />
        </Field>
        <Field label="Guests">
          <div className="flex h-10 items-center">
            <Stepper qty={guests} onInc={() => setGuests((g) => Math.min(50, g + 1))} onDec={() => setGuests((g) => Math.max(1, g - 1))} label="Guests" />
          </div>
        </Field>
      </div>
      <Field label="Date & time">
        <input name="at" type="datetime-local" required defaultValue={defaultSlot()} className="field" />
      </Field>
      <Field label="Note (optional)">
        <input name="note" className="field" placeholder="Birthday, window seat, Jain food…" />
      </Field>
      {guests > seats && <p className="text-xs text-accent-700 dark:text-accent-400">Party is larger than this table’s {seats} seats.</p>}
      <div className="flex gap-2 pt-1">
        <button type="button" className="btn btn-ghost flex-1" onClick={onDone}>Back</button>
        <button className="btn btn-primary flex-1"><CalendarClock className="size-4" /> Confirm booking</button>
      </div>
    </form>
  );
}
