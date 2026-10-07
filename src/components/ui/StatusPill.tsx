import type { TableStatus } from "@/types/pos";
import { cn } from "@/lib/cn";
import { statusTheme } from "./status";

export function StatusPill({ status, className }: { status: TableStatus; className?: string }) {
  const t = statusTheme[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap", t.pill, className)}>
      <span className={cn("size-1.5 rounded-full", t.dot)} />
      {t.label}
    </span>
  );
}
