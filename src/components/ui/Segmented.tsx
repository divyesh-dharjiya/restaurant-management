"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";

/** Pill tab switcher with an animated selection indicator. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  layoutId,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly { id: T; label: string }[];
  layoutId: string;
  label?: string;
}) {
  return (
    <div className="scrollbar-none flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-line bg-surface p-1" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} role="tab" aria-selected={value === o.id} onClick={() => onChange(o.id)} className="relative shrink-0 rounded-xl px-3.5 py-1.5 text-sm font-medium">
          {value === o.id && (
            <motion.span layoutId={layoutId} className="absolute inset-0 rounded-xl bg-brand-soft ring-1 ring-brand-600/25" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
          )}
          <span className={cn("relative", value === o.id ? "text-brand-800 dark:text-brand-300" : "text-muted hover:text-fg")}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
