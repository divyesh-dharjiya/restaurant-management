"use client";

import { cn } from "@/lib/cn";
import type { CategoryTab } from "./menuFilters";

/**
 * Category picker. Wraps onto multiple lines on wider screens so every
 * category is visible; scrolls sideways on phones.
 */
export function CategoryChips({ tabs, value, onChange }: { tabs: CategoryTab[]; value: string | null; onChange: (id: string) => void }) {
  return (
    <div
      className="scrollbar-none fade-x -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0 md:flex-wrap md:overflow-visible md:[mask-image:none]"
      role="tablist"
      aria-label="Menu categories"
      onWheel={(e) => {
        // Let a normal mouse wheel scroll the chip row sideways when it overflows.
        if (e.currentTarget.scrollWidth > e.currentTarget.clientWidth && Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY;
      }}
    >
      {tabs.map((c) => {
        const on = value === c.id;
        return (
          <button
            key={c.id}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(c.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition",
              on ? "border-brand-700 bg-brand-700 text-white shadow-sm shadow-brand-900/20" : "border-line bg-surface text-muted hover:border-brand-500/50 hover:text-fg",
            )}
          >
            <span aria-hidden>{c.emoji}</span>
            {c.name}
            <span className={cn("text-xs font-medium tabular-nums", on ? "text-white/90" : "text-subtle")}>{c.count}</span>
          </button>
        );
      })}
    </div>
  );
}
