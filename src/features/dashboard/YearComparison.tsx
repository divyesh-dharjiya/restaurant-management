import { change, type Summary } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { count, moneyWhole, signedPct } from "@/lib/format";

/** Full last year vs this year so far, side by side. */
export function YearComparison({ year, thisYear, lastYear }: { year: number; thisYear: Summary; lastYear: Summary }) {
  const rows = [
    { label: "Revenue", a: lastYear.revenue, b: thisYear.revenue, fmt: moneyWhole },
    { label: "Bills", a: lastYear.count, b: thisYear.count, fmt: count },
    { label: "Average bill", a: lastYear.avg, b: thisYear.avg, fmt: moneyWhole },
    { label: "Guests served", a: lastYear.guests, b: thisYear.guests, fmt: count },
    { label: "GST collected", a: lastYear.gst, b: thisYear.gst, fmt: moneyWhole },
  ];
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-line text-left text-xs text-muted">
          <th scope="col" className="pb-2 font-semibold" />
          <th scope="col" className="pb-2 text-right font-semibold">{year - 1}</th>
          <th scope="col" className="pb-2 text-right font-semibold">{year} YTD</th>
          <th scope="col" className="pb-2 text-right font-semibold">Change</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const d = change(r.b, r.a);
          return (
            <tr key={r.label} className="border-b border-line last:border-0">
              <th scope="row" className="py-2.5 text-left font-medium">{r.label}</th>
              <td className="py-2.5 text-right tabular-nums text-muted">{r.fmt(r.a)}</td>
              <td className="py-2.5 text-right font-semibold tabular-nums">{r.fmt(r.b)}</td>
              <td className={cn("py-2.5 text-right text-xs font-semibold tabular-nums", d === null ? "text-subtle" : d >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400")}>
                {d === null ? "—" : signedPct(d)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
