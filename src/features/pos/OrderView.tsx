"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { computeBill } from "@/lib/billing";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSession, selectTable } from "@/store/selectors";
import { addItem, decItem } from "@/store/slices/posSlice";
import { BackToTop, EmptyState } from "@/components/ui";
import { CATEGORY_TABS, POPULAR, filterMenu, type DietFilter } from "./menuFilters";
import { CategoryChips } from "./CategoryChips";
import { MenuSearch } from "./MenuSearch";
import { DishCard } from "./DishCard";
import { CartPanel } from "./CartPanel";
import { MobileCart } from "./MobileCart";
import { OrderHeader } from "./OrderHeader";
import { routes } from "@/config/site";

export function OrderView({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const table = useAppSelector(selectTable(id));
  const session = useAppSelector(selectSession(id));

  const [category, setCategory] = useState(POPULAR);
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState<ReadonlySet<DietFilter>>(new Set());
  const deferredQuery = useDeferredValue(query);
  const gridTop = useRef<HTMLDivElement>(null);

  const dishes = useMemo(() => filterMenu(category, diet, deferredQuery), [category, diet, deferredQuery]);
  const qtyOf = useMemo(() => new Map(session?.cart.map((l) => [l.itemId, l.qty])), [session]);

  if (!table) {
    return (
      <EmptyState icon={UtensilsCrossed} title="This table doesn’t exist">
        It may have been removed. <Link href={routes.floor} className="font-semibold text-brand-700 underline dark:text-brand-400">Back to floor</Link>
      </EmptyState>
    );
  }

  const pickCategory = (c: string) => {
    setCategory(c);
    setQuery("");
    // Bring the top of the grid into view without losing the sticky toolbar.
    if (gridTop.current && gridTop.current.getBoundingClientRect().top < 0) gridTop.current.scrollIntoView({ block: "start" });
  };
  const toggleDiet = (f: DietFilter) =>
    setDiet((s) => {
      const n = new Set(s);
      if (n.has(f)) n.delete(f);
      else n.add(f);
      return n;
    });

  const searching = deferredQuery.trim().length > 0;
  const heading = searching ? `Results for “${deferredQuery.trim()}”` : CATEGORY_TABS.find((t) => t.id === category)?.name;
  const totals = computeBill(session?.cart ?? [], session?.discountPct ?? 0);

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-6">
      <div className="min-w-0">
        <OrderHeader table={table} />

        <div className="sticky top-16 z-20 -mx-4 mt-4 space-y-3 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 xl:mx-0 xl:px-0">
          <MenuSearch query={query} onQuery={setQuery} diet={diet} onToggleDiet={toggleDiet} />
          <CategoryChips tabs={CATEGORY_TABS} value={searching ? null : category} onChange={pickCategory} />
        </div>

        <div ref={gridTop} className="flex scroll-mt-56 items-baseline justify-between pb-3 pt-5">
          <h2 className="text-lg font-bold">{heading}</h2>
          <span className="text-sm text-muted">{dishes.length} dishes</span>
        </div>

        {dishes.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} title="No dishes match your filters" />
        ) : (
          <div key={`${category}|${[...diet].join()}|${deferredQuery}`} className="animate-fade-up grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4">
            {dishes.map((item, i) => (
              <DishCard
                key={item.id}
                item={item}
                qty={qtyOf.get(item.id) ?? 0}
                priority={i < 4}
                onAdd={() => dispatch(addItem({ tableId: id, itemId: item.id }))}
                onDec={() => dispatch(decItem({ tableId: id, itemId: item.id }))}
              />
            ))}
          </div>
        )}
      </div>

      <aside className="card sticky top-20 hidden h-[calc(100dvh-6rem)] overflow-hidden xl:block" aria-label="Current order">
        <CartPanel tableId={id} />
      </aside>

      <MobileCart tableId={id} count={totals.itemCount} total={totals.total} />
      <BackToTop />
    </div>
  );
}
