"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { items } from "@/lib/catalog";
import { DIET_FILTERS, type DietFilter } from "./menuFilters";

type Props = { query: string; onQuery: (q: string) => void; diet: ReadonlySet<DietFilter>; onToggleDiet: (f: DietFilter) => void };

export function MenuSearch({ query, onQuery, diet, onToggleDiet }: Props) {
  return (
    <div className="flex gap-2">
      <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
        <Search className="size-4 shrink-0 text-subtle" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={`Search ${items.length} dishes…`}
          aria-label="Search dishes"
          className="w-full bg-transparent text-sm outline-none placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button onClick={() => onQuery("")} className="text-subtle hover:text-fg" aria-label="Clear search">
            <X className="size-4" />
          </button>
        )}
      </div>
      {DIET_FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onToggleDiet(f.id)}
          aria-pressed={diet.has(f.id)}
          className={cn(
            "flex h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition",
            diet.has(f.id) ? "border-brand-600/50 bg-brand-soft text-brand-800 dark:text-brand-300" : "border-line bg-surface text-muted hover:text-fg",
          )}
        >
          <span aria-hidden>{f.icon}</span>
          <span className="hidden sm:inline">{f.label}</span>
        </button>
      ))}
    </div>
  );
}
