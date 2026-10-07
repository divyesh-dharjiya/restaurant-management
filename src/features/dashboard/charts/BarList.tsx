"use client";

import { motion } from "motion/react";
import type { Row } from "@/lib/analytics";

/** Ranked horizontal bars with the value always labelled (single series). */
export function BarList({ rows, format, color = "var(--series-1)", empty = "No sales in this period" }: { rows: Row[]; format: (n: number) => string; color?: string; empty?: string }) {
  if (!rows.length) return <p className="grid h-40 place-items-center text-sm text-muted">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <ol className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={r.label} className="group" title={r.detail ? `${r.label} · ${r.detail}` : r.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">
              <span className="mr-1.5 text-xs tabular-nums text-subtle">{i + 1}</span>
              {r.label}
              {r.detail && <span className="ml-1.5 text-xs text-subtle">{r.detail}</span>}
            </span>
            <span className="shrink-0 font-semibold tabular-nums">{format(r.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full transition-opacity group-hover:opacity-80"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${(r.value / max) * 100}%` }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
