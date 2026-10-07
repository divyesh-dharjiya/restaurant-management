"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectPos, tableStatus } from "@/store/selectors";
import { Modal, StatusPill } from "@/components/ui";
import { TableOverview } from "./TableOverview";
import { BookingForm } from "./BookingForm";
import { SeatForm } from "./SeatForm";

type Mode = "view" | "book" | "seat";

/** Everything you can do with one table: seat, book, order, bill, free, edit, remove. */
export function TableSheet({ tableId, onClose, onEdit }: { tableId: string | null; onClose: () => void; onEdit: (id: string) => void }) {
  const { tables, sessions, bookings } = useAppSelector(selectPos);
  const table = tables.find((t) => t.id === tableId);
  const [mode, setMode] = useState<Mode>("view");
  const close = () => {
    setMode("view");
    onClose();
  };

  return (
    <Modal
      open={!!table}
      onClose={close}
      title={
        table && (
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold">{table.name}</h2>
            <StatusPill status={tableStatus({ sessions, bookings }, table.id)} />
            <span className="w-full text-xs text-muted">{table.zone} · {table.seats} seats</span>
          </div>
        )
      }
    >
      {table &&
        (mode === "book" ? (
          <BookingForm tableId={table.id} seats={table.seats} onDone={() => setMode("view")} />
        ) : mode === "seat" ? (
          <SeatForm tableId={table.id} seats={table.seats} onDone={() => setMode("view")} />
        ) : (
          <TableOverview
            tableId={table.id}
            onBook={() => setMode("book")}
            onSeat={() => setMode("seat")}
            onEdit={() => {
              close();
              onEdit(table.id);
            }}
            onClose={close}
          />
        ))}
    </Modal>
  );
}
