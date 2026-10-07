"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useScrollPast } from "@/hooks/useScrollPast";

export function BackToTop() {
  const show = useScrollPast(900);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0 })}
          className="fixed bottom-24 right-4 z-30 grid size-11 place-items-center rounded-full border border-line bg-surface text-fg shadow-card hover:bg-surface-2 xl:bottom-6 print:hidden"
          aria-label="Back to top"
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
