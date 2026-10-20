"use client";

import { useRef, useState } from "react";
import { ChefHat, Printer } from "lucide-react";
import { pendingLines, unsentCount } from "@/lib/kitchen";
import { printElement } from "@/lib/print";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSession, selectTickets } from "@/store/selectors";
import { sendToKitchen } from "@/store/slices/posSlice";
import { KotSlip } from "@/features/kitchen/KotSlip";

/** "Send to kitchen" bar in the order panel: shows what the kitchen hasn't seen yet. */
export function KitchenSend({ tableId }: { tableId: string }) {
  const dispatch = useAppDispatch();
  const session = useAppSelector(selectSession(tableId));
  const tickets = useAppSelector(selectTickets);
  const [sentId, setSentId] = useState<string | null>(null);
  const slipRef = useRef<HTMLDivElement>(null);
  if (!session) return null;

  const pending = unsentCount(session);
  const changed = pendingLines(session).length > 0;
  const last = tickets.find((t) => t.id === sentId);

  const send = () => {
    const action = sendToKitchen(tableId);
    dispatch(action);
    setSentId(action.payload.id);
  };

  if (!changed) {
    return last ? (
      <div className="flex items-center justify-between gap-2 border-t border-line bg-brand-soft/60 px-4 py-2 text-xs font-semibold text-brand-800 dark:text-brand-300" role="status">
        <span className="flex items-center gap-1.5"><ChefHat className="size-4" /> {last.number} sent to kitchen</span>
        <button onClick={() => printElement(slipRef.current)} className="flex items-center gap-1 underline underline-offset-2"><Printer className="size-3.5" /> Print KOT</button>
        <div className="hidden"><KotSlip ref={slipRef} ticket={last} /></div>
      </div>
    ) : null;
  }

  return (
    <div className="flex items-center justify-between gap-3 border-t border-line bg-accent-soft/70 px-4 py-2.5">
      <span className="text-xs font-semibold text-accent-700 dark:text-accent-400">
        {pending > 0 ? `${pending} ${pending === 1 ? "dish" : "dishes"} not sent to kitchen` : "Changes not sent to kitchen"}
      </span>
      <button onClick={send} className="btn btn-primary h-9 shrink-0 px-3 text-xs"><ChefHat className="size-4" /> Send KOT</button>
    </div>
  );
}
