"use client";

import { AnimatePresence } from "motion/react";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { computeBill } from "@/lib/billing";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSession } from "@/store/selectors";
import { clearCart } from "@/store/slices/posSlice";
import { CartLineItem } from "./CartLineItem";
import { CartSummary } from "./CartSummary";

export function CartPanel({ tableId, onClose }: { tableId: string; onClose?: () => void }) {
  const session = useAppSelector(selectSession(tableId));
  const dispatch = useAppDispatch();
  const cart = session?.cart ?? [];
  const totals = computeBill(cart, session?.discountPct ?? 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
        <h2 className="flex items-center gap-2 font-bold">
          <ShoppingBag className="size-4 text-brand-700 dark:text-brand-400" /> Current order
          <span className="rounded-full bg-surface-2 px-2 text-xs tabular-nums text-muted">{totals.itemCount}</span>
        </h2>
        <div className="flex items-center gap-1">
          {cart.length > 0 && (
            <button
              onClick={() => confirm("Remove all items from this order?") && dispatch(clearCart(tableId))}
              className="grid size-9 place-items-center rounded-lg text-subtle hover:bg-rose-500/10 hover:text-rose-600"
              aria-label="Clear order"
            >
              <Trash2 className="size-4" />
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2" aria-label="Close">
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
        {cart.length === 0 ? (
          <div className="grid h-full min-h-48 place-items-center text-center text-sm text-muted">
            <div>
              <div className="mx-auto mb-3 grid size-14 animate-float place-items-center rounded-2xl bg-brand-soft text-2xl">🍽️</div>
              No items yet.
              <br />
              Tap a dish to add it.
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {cart.map((line) => (
                <CartLineItem key={line.itemId} tableId={tableId} line={line} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {cart.length > 0 && <CartSummary tableId={tableId} totals={totals} discountPct={session?.discountPct ?? 0} />}
    </div>
  );
}
