import type { TableStatus } from "@/types/pos";

/** One colour per table state, used by pills, cards and the table illustration. */
export const statusTheme: Record<TableStatus, { label: string; pill: string; dot: string; ink: string; ring: string; glow: string }> = {
  free: {
    label: "Available",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    ink: "text-emerald-500",
    ring: "border-line",
    glow: "",
  },
  reserved: {
    label: "Reserved",
    pill: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
    ink: "text-violet-500",
    ring: "border-violet-500/40",
    glow: "shadow-lg shadow-violet-500/10",
  },
  seated: {
    label: "Seated",
    pill: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
    ink: "text-sky-500",
    ring: "border-sky-500/40",
    glow: "shadow-lg shadow-sky-500/10",
  },
  ordering: {
    label: "Ordering",
    pill: "bg-accent-500/15 text-accent-700 dark:text-accent-400",
    dot: "bg-accent-500",
    ink: "text-accent-500",
    ring: "border-accent-500/50",
    glow: "shadow-lg shadow-accent-500/15",
  },
  billing: {
    label: "Bill requested",
    pill: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
    ink: "text-rose-500",
    ring: "border-rose-500/50",
    glow: "shadow-lg shadow-rose-500/15",
  },
};
