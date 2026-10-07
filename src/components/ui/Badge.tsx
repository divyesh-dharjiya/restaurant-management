import { cn } from "@/lib/cn";

const tones = {
  brand: "bg-brand-700 text-white",
  accent: "bg-accent-400 text-amber-950",
  violet: "bg-violet-600 text-white",
  light: "bg-white/90 text-rose-600",
  soft: "bg-surface-2 text-muted",
} as const;

export function Badge({ tone = "soft", className, children }: { tone?: keyof typeof tones; className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm", tones[tone], className)}>{children}</span>;
}
