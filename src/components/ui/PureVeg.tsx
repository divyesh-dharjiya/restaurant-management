import { Leaf } from "lucide-react";
import { cn } from "@/lib/cn";

export function PureVeg({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand-800 ring-1 ring-brand-600/20 dark:text-brand-300", className)}>
      <Leaf className="size-3" /> 100% Pure Veg
    </span>
  );
}
