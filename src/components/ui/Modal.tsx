"use client";

import { useEffect, useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/** Centered dialog on desktop, bottom sheet on mobile. Closes on Esc / backdrop. */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            className={cn("relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl sm:rounded-3xl", wide ? "sm:max-w-2xl" : "sm:max-w-md")}
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div id={titleId} className="min-w-0 flex-1">{title}</div>
              <button onClick={onClose} className="grid size-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-fg" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
