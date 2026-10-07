"use client";

import { useState } from "react";
import { UserCheck } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { seatTable } from "@/store/slices/posSlice";
import { Field, Stepper } from "@/components/ui";

/** Seat a walk-in party without starting an order. */
export function SeatForm({ tableId, seats, onDone }: { tableId: string; seats: number; onDone: () => void }) {
  const dispatch = useAppDispatch();
  const [guests, setGuests] = useState(Math.min(2, seats));
  const [name, setName] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        dispatch(seatTable({ tableId, guests, guestName: name.trim() || undefined }));
        onDone();
      }}
      className="space-y-4"
    >
      <Field label="Guests">
        <Stepper qty={guests} onInc={() => setGuests((g) => Math.min(50, g + 1))} onDec={() => setGuests((g) => Math.max(1, g - 1))} label="Guests" />
      </Field>
      <Field label="Name (optional)">
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus className="field" placeholder="Walk-in" />
      </Field>
      <div className="flex gap-2 pt-1">
        <button type="button" className="btn btn-ghost flex-1" onClick={onDone}>Back</button>
        <button className="btn btn-primary flex-1"><UserCheck className="size-4" /> Seat guests</button>
      </div>
    </form>
  );
}
