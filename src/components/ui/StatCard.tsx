import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { signedPct } from "@/lib/format";

/** KPI tile: headline number plus optional change vs a comparison period. */
export function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  delta,
  compareLabel,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  iconClass?: string;
  delta?: number | null;
  compareLabel?: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted">
        {label}
        {Icon && (
          <span className={cn("grid size-8 place-items-center rounded-lg bg-surface-2", iconClass)}>
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="mt-2 text-xl font-extrabold tracking-tight tabular-nums sm:text-2xl">{value}</div>
      {delta !== undefined && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          {delta === null ? (
            <span>No data for {compareLabel}</span>
          ) : (
            <>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold",
                  up ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-rose-500/10 text-rose-700 dark:text-rose-400",
                )}
              >
                {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                {signedPct(delta)}
              </span>
              <span>vs {compareLabel}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
