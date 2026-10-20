import { cn } from "@/lib/cn";

type Props = { qty: number; onInc: () => void; onDec: () => void; size?: "sm" | "md"; label?: string; incDisabled?: boolean };

export function Stepper({ qty, onInc, onDec, size = "md", label, incDisabled }: Props) {
  const btn = cn("grid place-items-center rounded-lg font-bold transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-40", size === "sm" ? "size-7 text-sm" : "size-8");
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-brand-600/30 bg-brand-soft p-0.5" role="group" aria-label={label}>
      <button type="button" onClick={onDec} className={cn(btn, "text-brand-800 hover:bg-brand-600/15 dark:text-brand-300")} aria-label={label ? `Decrease ${label}` : "Decrease"}>−</button>
      <span className="min-w-6 text-center text-sm font-semibold tabular-nums" aria-live="polite">{qty}</span>
      <button type="button" onClick={onInc} disabled={incDisabled} className={cn(btn, "bg-brand-700 text-white hover:bg-brand-800")} aria-label={label ? `Increase ${label}` : "Increase"}>+</button>
    </div>
  );
}
