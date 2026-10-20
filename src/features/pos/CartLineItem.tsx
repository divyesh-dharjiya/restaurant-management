"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { StickyNote, X } from "lucide-react";
import type { CartLine } from "@/lib/billing";
import { itemById } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSoldOut } from "@/store/selectors";
import { addItem, decItem, removeItem, setNote } from "@/store/slices/posSlice";
import { FoodImage, Stepper } from "@/components/ui";

export function CartLineItem({ tableId, line }: { tableId: string; line: CartLine }) {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const soldOut = useAppSelector(selectSoldOut).includes(line.itemId);
  const item = itemById.get(line.itemId);
  if (!item) return null;
  const ids = { tableId, itemId: line.itemId };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
      className="overflow-hidden rounded-xl border border-line bg-surface p-2.5"
    >
      <div className="flex gap-3">
        <FoodImage src={item.image} alt="" sizes="56px" className="size-14 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="line-clamp-1 text-sm font-semibold">{item.name}</div>
            <button onClick={() => dispatch(removeItem(ids))} className="text-subtle hover:text-rose-600" aria-label={`Remove ${item.name}`}>
              <X className="size-3.5" />
            </button>
          </div>
          <div className="text-xs text-muted tabular-nums">{money(item.price)} each</div>
          <div className="mt-1.5 flex items-center justify-between">
            <Stepper size="sm" qty={line.qty} label={item.name} onInc={() => dispatch(addItem(ids))} onDec={() => dispatch(decItem(ids))} incDisabled={soldOut} />
            <span className="text-sm font-bold tabular-nums">{money(item.price * line.qty)}</span>
          </div>
        </div>
      </div>
      <button onClick={() => setEditing((v) => !v)} className={cn("mt-2 flex items-center gap-1 text-xs", line.note ? "text-brand-700 dark:text-brand-300" : "text-subtle hover:text-muted")}>
        <StickyNote className="size-3" /> {line.note || "Add note for kitchen"}
      </button>
      {editing && (
        <input
          autoFocus
          defaultValue={line.note}
          placeholder="e.g. less spicy, no onion"
          onBlur={(e) => {
            dispatch(setNote({ ...ids, note: e.target.value.trim() }));
            setEditing(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="field mt-2 h-9 text-xs"
        />
      )}
    </motion.li>
  );
}
