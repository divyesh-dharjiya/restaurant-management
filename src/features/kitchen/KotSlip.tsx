import { forwardRef } from "react";
import type { KitchenTicket } from "@/types/pos";

/** Printable kitchen order ticket, styled like a thermal-printer slip. */
export const KotSlip = forwardRef<HTMLDivElement, { ticket: KitchenTicket }>(function KotSlip({ ticket }, ref) {
  const d = new Date(ticket.createdAt);
  return (
    <div ref={ref} className="mx-auto w-full max-w-xs rounded-xl bg-[#fdfcf9] p-4 font-mono text-[13px] leading-relaxed text-zinc-900">
      <div className="text-center font-sans text-base font-bold tracking-widest">KITCHEN ORDER</div>
      <div className="mt-1 flex justify-between font-bold">
        <span>{ticket.number}</span>
        <span>{ticket.tableName}</span>
      </div>
      <div className="text-zinc-600">{d.toLocaleDateString("en-IN")} {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
      <div className="my-2 border-t border-dashed border-zinc-400" />
      <ul className="space-y-1">
        {ticket.lines.map((l) => (
          <li key={l.itemId}>
            <div className="flex gap-3 font-bold">
              <span className="w-10 shrink-0 text-right">{l.qty > 0 ? `${l.qty} ×` : "VOID"}</span>
              <span className={l.qty < 0 ? "line-through" : undefined}>{l.name}</span>
              {l.qty < 0 && <span className="ml-auto shrink-0">{-l.qty}</span>}
            </div>
            {l.note && <div className="pl-[3.25rem] text-zinc-700">» {l.note}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
});
