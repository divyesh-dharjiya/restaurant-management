"use client";

import { Flame, Leaf, Plus, Sparkles } from "lucide-react";
import type { MenuItem } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { Badge, FoodImage, Stepper } from "@/components/ui";

type Props = { item: MenuItem; qty: number; priority?: boolean; soldOut?: boolean; onAdd: () => void; onDec: () => void };

export function DishCard({ item, qty, priority, soldOut, onAdd, onDec }: Props) {
  return (
    <article className={cn("card cv-auto group flex flex-col overflow-hidden transition", !soldOut && "hover:-translate-y-0.5 hover:shadow-lg", qty > 0 && "border-brand-600/60 ring-1 ring-brand-600/40")}>
      <button onClick={onAdd} disabled={soldOut} className="relative block overflow-hidden text-left disabled:cursor-not-allowed" aria-label={soldOut ? `${item.name}, sold out` : `Add ${item.name}`}>
        <FoodImage src={item.image} alt={item.name} priority={priority} className={cn("aspect-[4/3] transition duration-500", soldOut ? "grayscale" : "group-hover:scale-[1.03]")} />
        {soldOut && <span className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-extrabold uppercase tracking-widest text-white">Sold out</span>}
        <div className="absolute inset-x-2 top-2 flex flex-wrap gap-1">
          {item.popular && <Badge tone="accent"><Flame className="size-3" /> Bestseller</Badge>}
          {item.isNew && <Badge tone="violet"><Sparkles className="size-3" /> New</Badge>}
          {item.jain && <Badge tone="brand"><Leaf className="size-3" /> Jain</Badge>}
          {item.spicy && <Badge tone="light">🌶️ Spicy</Badge>}
        </div>
        {qty > 0 && <span className="absolute bottom-2 right-2 grid size-7 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white shadow">{qty}</span>}
      </button>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-1 text-sm font-bold">{item.name}</h3>
        <p className="mt-0.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted">{item.description}</p>
        {/* Wraps the stepper under the price when the card is narrow (2-up on phones). */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="font-extrabold tabular-nums">{money(item.price)}</span>
          {soldOut && qty === 0 ? (
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Unavailable</span>
          ) : qty > 0 ? (
            <Stepper size="sm" qty={qty} onInc={onAdd} onDec={onDec} label={item.name} incDisabled={soldOut} />
          ) : (
            <button
              onClick={onAdd}
              className="flex h-8 items-center gap-1 rounded-lg border border-brand-600/40 bg-brand-soft px-3 text-xs font-bold text-brand-800 transition hover:bg-brand-700 hover:text-white active:scale-95 dark:text-brand-300 dark:hover:text-white"
            >
              <Plus className="size-3.5" /> ADD
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
