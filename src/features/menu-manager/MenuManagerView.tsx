"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, RotateCcw, Search, UtensilsCrossed } from "lucide-react";
import { routes } from "@/config/site";
import { categories, items } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSoldOut } from "@/store/selectors";
import { toggleSoldOut } from "@/store/slices/posSlice";
import { EmptyState, FoodImage, PageHeader, Segmented, useConfirm } from "@/components/ui";

type Show = "all" | "soldOut";
const SHOW: { id: Show; label: string }[] = [
  { id: "all", label: "All dishes" },
  { id: "soldOut", label: "Sold out" },
];

/** Mark dishes sold out (86'd) so the till can't add them until they're back. */
export function MenuManagerView() {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const soldOut = useAppSelector(selectSoldOut);
  const off = useMemo(() => new Set(soldOut), [soldOut]);
  const [query, setQuery] = useState("");
  const [show, setShow] = useState<Show>("all");
  const q = useDeferredValue(query).trim().toLowerCase();

  const sections = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, items: items.filter((i) => i.categoryId === c.id && (show === "all" || off.has(i.id)) && (!q || i.name.toLowerCase().includes(q))) }))
        .filter((c) => c.items.length),
    [q, show, off],
  );

  const restoreAll = async () => {
    if (!(await confirm({ title: `Make all ${soldOut.length} dishes available again?`, confirmLabel: "Restore all" }))) return;
    soldOut.forEach((id) => dispatch(toggleSoldOut(id)));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu availability"
        subtitle={soldOut.length ? `${soldOut.length} of ${items.length} dishes sold out` : `All ${items.length} dishes available`}
        actions={
          <>
            {soldOut.length > 0 && (
              <button className="btn btn-ghost" onClick={restoreAll}><RotateCcw className="size-4" /> Restore all</button>
            )}
            <Link href={routes.menu} className="btn btn-ghost" target="_blank" rel="noopener">
              Public menu <ExternalLink className="size-4" />
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-brand-500 sm:max-w-sm">
          <Search className="size-4 text-subtle" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a dish" aria-label="Find a dish" className="w-full bg-transparent text-sm outline-none placeholder:text-subtle" />
        </div>
        <Segmented value={show} onChange={setShow} options={SHOW} layoutId="avail-tab" label="Show" />
      </div>

      {!sections.length ? (
        <EmptyState icon={UtensilsCrossed} title={show === "soldOut" && !q ? "Nothing is sold out" : "No dishes match"} />
      ) : (
        sections.map((c) => (
          <section key={c.id} aria-labelledby={`mm-${c.id}`}>
            <h2 id={`mm-${c.id}`} className="mb-2 flex items-center gap-2 font-bold">
              <span aria-hidden>{c.emoji}</span> {c.name}
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {c.items.map((i) => {
                const available = !off.has(i.id);
                return (
                  <li key={i.id} className={cn("card flex items-center gap-3 p-2.5 transition", !available && "opacity-70")}>
                    <FoodImage src={i.image} alt="" sizes="48px" className={cn("size-12 shrink-0 rounded-lg", !available && "grayscale")} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{i.name}</div>
                      <div className="text-xs text-muted tabular-nums">{money(i.price)}</div>
                    </div>
                    <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-semibold">
                      <span className={available ? "text-brand-700 dark:text-brand-400" : "text-rose-600 dark:text-rose-400"}>{available ? "Available" : "Sold out"}</span>
                      <input type="checkbox" role="switch" checked={available} onChange={() => dispatch(toggleSoldOut(i.id))} aria-label={`${i.name} available`} className="peer sr-only" />
                      <span className="relative h-6 w-10 rounded-full bg-rose-500/30 transition peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4" />
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
