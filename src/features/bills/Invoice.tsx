import { business, tax } from "@/lib/catalog";
import { money } from "@/lib/format";
import type { BillTotals } from "@/lib/billing";

type Props = {
  number: string;
  tableName: string;
  guests: number;
  createdAt: number;
  totals: BillTotals;
  payment?: string;
};

/** Thermal-receipt style GST tax invoice. `id="invoice"` is what gets printed. */
export function Invoice({ number, tableName, guests, createdAt, totals: t, payment }: Props) {
  const d = new Date(createdAt);
  return (
    <div id="invoice" className="mx-auto w-full max-w-sm rounded-2xl bg-[#fdfcf9] p-6 font-mono text-[12px] leading-relaxed text-zinc-800 border border-black/5 shadow-lg">
      <div className="text-center">
        <div className="font-sans text-lg font-bold tracking-tight text-zinc-900">{business.name}</div>
        <div className="mt-1 font-sans text-xs text-zinc-600">GSTIN: {business.gstin}</div>
        <div className="font-sans text-xs text-zinc-600">FSSAI: {business.fssai}</div>
        <div className="mt-2 font-sans text-sm font-semibold tracking-widest">TAX INVOICE</div>
      </div>

      <Dash />
      <div className="grid grid-cols-2 gap-x-2">
        <span>Bill: {number}</span>
        <span className="text-right">{tableName}</span>
        <span>{d.toLocaleDateString("en-IN")}</span>
        <span className="text-right">{d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
        <span>Guests: {guests}</span>
        {payment && <span className="text-right">Paid: {payment}</span>}
      </div>
      <Dash />

      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 font-semibold">
        <span>Item</span><span className="text-right">Qty</span><span className="text-right">Rate</span><span className="text-right">Amt</span>
      </div>
      <Dash />
      {t.lines.map((l) => (
        <div key={l.itemId} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3">
          <span className="truncate">{l.name}</span>
          <span className="text-right">{l.qty}</span>
          <span className="text-right">{l.price.toFixed(2)}</span>
          <span className="text-right">{l.amount.toFixed(2)}</span>
        </div>
      ))}
      <Dash />

      <Line label={`Subtotal (${t.itemCount} items)`} value={t.subtotal} />
      {t.discount > 0 && <Line label={`Discount ${t.discountPct}%`} value={-t.discount} />}
      {t.serviceCharge > 0 && <Line label={`Service charge ${tax.serviceCharge}%`} value={t.serviceCharge} />}
      <Line label="Taxable value" value={t.taxable} />
      <Line label={`CGST @ ${tax.cgst}%`} value={t.cgst} />
      <Line label={`SGST @ ${tax.sgst}%`} value={t.sgst} />
      {t.roundOff !== 0 && <Line label="Round off" value={t.roundOff} />}
      <Dash />
      <div className="flex justify-between font-sans text-base font-bold text-zinc-900">
        <span>GRAND TOTAL</span>
        <span>{money(t.total)}</span>
      </div>
      <Dash />
      <div className="text-center text-[11px] text-zinc-500">
        Prices inclusive of all charges · GST {tax.cgst + tax.sgst}%<br />
        Thank you! Visit again 🙏
      </div>
    </div>
  );
}

const Dash = () => <div className="my-2 border-t border-dashed border-zinc-400" />;

function Line({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value.toFixed(2)}</span>
    </div>
  );
}
