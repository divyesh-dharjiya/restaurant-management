"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useStorageHealth, usageRatio, WARN_AT } from "@/store/storageHealth";
import { routes } from "@/config/site";

/** App-wide warning when saving failed or browser storage is nearly full. */
export function StorageBanner() {
  const health = useStorageHealth();
  const ratio = usageRatio(health);
  if (health.ok && ratio < WARN_AT) return null;

  return (
    <div role="alert" className="border-b border-rose-500/30 bg-rose-500/10 print:hidden">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm text-rose-800 sm:px-6 dark:text-rose-200">
        <AlertTriangle className="size-4 shrink-0" />
        <span className="flex-1">
          {health.ok
            ? `Browser storage is ${Math.round(ratio * 100)}% full. Back up and archive old bills soon.`
            : "Your latest changes could not be saved — browser storage is full or blocked. Back up now to avoid losing bills."}
        </span>
        <Link href={`${routes.bills}#data`} className="font-semibold underline underline-offset-2">Back up now</Link>
      </div>
    </div>
  );
}
