import type { Bill } from "@/types/pos";
import { dateTime, money } from "@/lib/format";

export function BillsTable({ bills, onOpen }: { bills: Bill[]; onOpen: (id: string) => void }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Settled bills</caption>
        <thead className="text-left text-xs uppercase tracking-wider text-muted">
          <tr className="border-b border-line">
            <th scope="col" className="p-3 font-semibold sm:p-4">Bill no.</th>
            <th scope="col" className="p-3 font-semibold sm:p-4">Table</th>
            <th scope="col" className="hidden p-3 font-semibold sm:table-cell sm:p-4">Date</th>
            <th scope="col" className="hidden p-3 font-semibold md:table-cell md:p-4">Items</th>
            <th scope="col" className="hidden p-3 font-semibold md:table-cell md:p-4">Payment</th>
            <th scope="col" className="p-3 text-right font-semibold sm:p-4">Total</th>
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
              <td className="whitespace-nowrap p-3 font-mono text-[11px] sm:p-4 sm:text-xs">
                {b.number}
                {b.demo && <span className="ml-2 hidden rounded sm:inline bg-surface-2 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-subtle">sample</span>}
                {b.voided && <span className="ml-2 rounded bg-rose-500/10 px-1.5 py-0.5 font-sans text-[10px] font-bold text-rose-700 dark:text-rose-300">VOID</span>}
              </td>
              <td className="whitespace-nowrap p-3 font-medium sm:p-4">{b.tableName}</td>
              <td className="hidden p-4 text-muted sm:table-cell">{dateTime(b.createdAt)}</td>
              <td className="hidden p-4 text-muted md:table-cell">{b.totals.itemCount}</td>
              <td className="hidden p-4 md:table-cell"><span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold">{b.payment}</span></td>
              <td className="whitespace-nowrap p-3 text-right font-bold tabular-nums sm:p-4">{money(b.totals.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
