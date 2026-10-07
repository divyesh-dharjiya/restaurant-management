"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { money } from "@/lib/format";
import { CartPanel } from "./CartPanel";

/** Floating "view order" bar that opens the cart as a bottom sheet (below xl). */
export function MobileCart({ tableId, count, total }: { tableId: string; count: number; total: number }) {
  const [open, setOpen] = useState(false);
  return (
    <AnimatePresence>
      {count > 0 && !open && (
        <motion.button
          key="bar"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          onClick={() => setOpen(true)}
          className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-xl items-center justify-between rounded-2xl bg-brand-700 px-5 py-4 font-bold text-white shadow-2xl shadow-brand-900/30 xl:hidden"
        >
          <span className="flex items-center gap-2"><ShoppingBag className="size-5" /> {count} items · View order</span>
          <span className="tabular-nums">{money(total)}</span>
        </motion.button>
      )}
      {open && (
        <div key="sheet" className="fixed inset-0 z-50 xl:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/50" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className="absolute inset-x-0 bottom-0 mx-auto h-[88dvh] max-w-xl overflow-hidden rounded-t-3xl border border-line bg-surface"
          >
            <CartPanel tableId={tableId} onClose={() => setOpen(false)} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
