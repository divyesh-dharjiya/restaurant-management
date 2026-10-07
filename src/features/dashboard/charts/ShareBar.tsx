"use client";

import { motion } from "motion/react";

export type Share = { name: string; color: string; value: number; detail?: string };

/** Part-to-whole as one stacked bar with 2px gaps, labelled legend underneath. */
export function ShareBar({ parts, format }: { parts: Share[]; format: (n: number) => string }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (!total) return <p className="grid h-40 place-items-center text-sm text-muted">No sales in this period</p>;
  const shown = parts.filter((p) => p.value > 0);

  return (
    <div>
      <div className="flex h-4 gap-[2px] overflow-hidden rounded-full" role="img" aria-label={shown.map((p) => `${p.name} ${Math.round((p.value / total) * 100)}%`).join(", ")}>
        {shown.map((p, i) => (
          <motion.div
            key={p.name}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ background: p.color }}
            initial={{ flexGrow: 0.0001 }}
            animate={{ flexGrow: p.value }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
          />
        ))}
      </div>
      <ul className="mt-5 space-y-3">
        {parts.map((p) => (
          <li key={p.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-[4px]" style={{ background: p.color }} aria-hidden />
              <span className="font-medium">{p.name}</span>
              {p.detail && <span className="text-xs text-subtle">{p.detail}</span>}
            </span>
            <span className="text-right">
              <span className="font-semibold tabular-nums">{format(p.value)}</span>
              <span className="ml-2 inline-block w-10 text-xs tabular-nums text-muted">{Math.round((p.value / total) * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
