import type { Bill } from "@/types/pos";
import { dateTime, money } from "@/lib/format";

export function BillsTable({ bills, onOpen }: { bills: Bill[]; onOpen: (id: string) => void }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Settled bills</caption>
        <thead className="text-left text-xs uppercase tracking-wider text-muted">
          <tr className="border-b border-line">
            <th scope="col" className="p-4 font-semibold">Bill no.</th>
            <th scope="col" className="p-4 font-semibold">Table</th>
            <th scope="col" className="hidden p-4 font-semibold sm:table-cell">Date</th>
            <th scope="col" className="hidden p-4 font-semibold md:table-cell">Items</th>
            <th scope="col" className="hidden p-4 font-semibold md:table-cell">Payment</th>
            <th scope="col" className="p-4 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => (
            <tr
              key={b.id}
              tabIndex={0}
              onClick={() => onOpen(b.id)}
              onKeyDown={(e) => e.key === "Enter" && onOpen(b.id)}
              className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-surface-2 focus-visible:bg-surface-2"
            >
              <td className="p-4 font-mono text-xs">
                {b.number}
                {b.demo && <span className="ml-2 rounded bg-surface-2 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-subtle">sample</span>}
              </td>
              <td className="p-4 font-medium">{b.tableName}</td>
              <td className="hidden p-4 text-muted sm:table-cell">{dateTime(b.createdAt)}</td>
              <td className="hidden p-4 text-muted md:table-cell">{b.totals.itemCount}</td>
              <td className="hidden p-4 md:table-cell"><span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold">{b.payment}</span></td>
              <td className="p-4 text-right font-bold tabular-nums">{money(b.totals.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
