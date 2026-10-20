"use client";

import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { useScrollPast } from "@/hooks/useScrollPast";

/** Plain CSS transition (no animation library) so it stays cheap on public pages. */
export function BackToTop() {
  const show = useScrollPast(900);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0 })}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={cn(
        "fixed bottom-24 right-4 z-30 grid size-11 place-items-center rounded-full border border-line bg-surface text-fg shadow-card transition duration-200 hover:bg-surface-2 xl:bottom-6 print:hidden",
        show ? "scale-100 opacity-100" : "pointer-events-none scale-75 opacity-0",
      )}
      aria-label="Back to top"
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
