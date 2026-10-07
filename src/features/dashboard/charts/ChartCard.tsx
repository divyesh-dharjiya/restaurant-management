import { cn } from "@/lib/cn";

export type Series = { name: string; color: string; values: number[] };
export type DataTable = { columns: string[]; rows: (string | number)[][] };

export function Legend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {items.map((s) => (
        <li key={s.name} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ background: s.color }} aria-hidden />
          {s.name}
        </li>
      ))}
    </ul>
  );
}

/** Frame for every chart: title, optional legend/actions, and an accessible table view. */
export function ChartCard({ title, subtitle, legend, table, className, children }: { title: string; subtitle?: string; legend?: React.ReactNode; table?: DataTable; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("card flex flex-col p-4 sm:p-5", className)} aria-label={title}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-bold">{title}</h2>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        {legend}
      </header>
      <div className="flex-1">{children}</div>
      {table && (
        <details className="group mt-3 text-xs">
          <summary className="cursor-pointer select-none text-muted hover:text-fg">View as table</summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full tabular-nums">
              <thead>
                <tr className="border-b border-line text-left text-muted">
                  {table.columns.map((c) => <th key={c} scope="col" className="py-1.5 pr-3 font-semibold">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    {r.map((v, j) => <td key={j} className="py-1.5 pr-3">{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}
