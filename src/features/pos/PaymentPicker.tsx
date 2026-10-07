import { Banknote, CreditCard, QrCode, type LucideIcon } from "lucide-react";
import type { PaymentMode } from "@/types/pos";
import { cn } from "@/lib/cn";

const MODES: { id: PaymentMode; icon: LucideIcon }[] = [
  { id: "Cash", icon: Banknote },
  { id: "UPI", icon: QrCode },
  { id: "Card", icon: CreditCard },
];

export function PaymentPicker({ value, onChange }: { value: PaymentMode; onChange: (m: PaymentMode) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Payment mode</legend>
      <div className="grid grid-cols-3 gap-2">
        {MODES.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={value === id}
            onClick={() => onChange(id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border py-3 text-sm font-semibold transition",
              value === id ? "border-brand-600 bg-brand-soft text-brand-800 dark:text-brand-300" : "border-line text-muted hover:bg-surface-2",
            )}
          >
            <Icon className="size-5" /> {id}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
