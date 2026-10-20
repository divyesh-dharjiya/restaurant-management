import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Bill } from "@/types/pos";
import { dateTime, money } from "@/lib/format";
import { routes } from "@/config/site";

export function RecentBills({ bills }: { bills: Bill[] }) {
  return (
    <div className="flex h-full flex-col">
      <ul className="divide-y divide-line">
        {bills.map((b) => (
          <li key={b.id}>
            <Link href={routes.invoice(b.id)} className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition hover:bg-surface-2">
              <span className="min-w-0">
                <span className="block truncate font-medium">{b.tableName} · {b.payment}</span>
                <span className="block text-xs text-muted">{dateTime(b.createdAt)}</span>
              </span>
              <span className="font-bold tabular-nums">{money(b.totals.total)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href={routes.bills} className="mt-auto flex items-center gap-1 pt-3 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400">
        All bills <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
