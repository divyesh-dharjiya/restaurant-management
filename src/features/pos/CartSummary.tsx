"use client";

import { useRouter } from "next/navigation";
import { ReceiptText } from "lucide-react";
import type { BillTotals } from "@/lib/billing";
import { tax } from "@/lib/catalog";
import { money } from "@/lib/format";
import { useAppDispatch } from "@/store/hooks";
import { requestBill, setDiscount } from "@/store/slices/posSlice";

export function CartSummary({ tableId, totals: t, discountPct }: { tableId: string; totals: BillTotals; discountPct: number }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <div className="space-y-2 border-t border-line bg-surface-2/60 p-4 text-sm">
      <Row label="Subtotal" value={money(t.subtotal)} />
      <div className="flex items-center justify-between text-muted">
        <label htmlFor={`disc-${tableId}`}>Discount</label>
        <div className="flex items-center gap-2">
          <div className="flex h-8 items-center rounded-lg border border-line bg-surface">
            <input
              id={`disc-${tableId}`}
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              value={discountPct || ""}
              placeholder="0"
              onChange={(e) => dispatch(setDiscount({ tableId, pct: Number(e.target.value) }))}
              className="w-12 bg-transparent px-2 text-right text-xs text-fg outline-none [appearance:textfield]"
            />
            <span className="pr-2 text-xs">%</span>
          </div>
          <span className="w-20 text-right tabular-nums text-fg">−{money(t.discount)}</span>
        </div>
      </div>
      <Row label={`CGST ${tax.cgst}%`} value={money(t.cgst)} />
      <Row label={`SGST ${tax.sgst}%`} value={money(t.sgst)} />
      <div className="flex items-end justify-between border-t border-dashed border-line pt-3">
        <span className="font-semibold text-muted">Total</span>
        <span className="text-2xl font-extrabold tabular-nums">{money(t.total)}</span>
      </div>
      <button
        onClick={() => {
          dispatch(requestBill(tableId));
          router.push(`/table/${tableId}/bill`);
        }}
        className="btn btn-primary mt-2 h-12 w-full text-base"
      >
        <ReceiptText className="size-4" /> Generate bill
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted">
      <span>{label}</span>
      <span className="tabular-nums text-fg">{value}</span>
    </div>
  );
}
