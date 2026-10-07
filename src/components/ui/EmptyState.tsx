import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: React.ReactNode }) {
  return (
    <div className="card grid min-h-56 place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface-2 text-subtle">
          <Icon className="size-6" />
        </span>
        <p className="mt-3 font-semibold">{title}</p>
        {children && <div className="mt-1 text-sm text-muted">{children}</div>}
      </div>
    </div>
  );
}
