"use client";

import { useRef, useState } from "react";
import { Archive, DatabaseBackup, FileSpreadsheet, Trash2, Upload } from "lucide-react";
import type { Bill } from "@/types/pos";
import { billsToCsv, downloadFile, stamp } from "@/lib/export";
import { count } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { normalizeState } from "@/store/persistence";
import { selectPos } from "@/store/selectors";
import { archiveBills, removeDemoBills, replace } from "@/store/slices/posSlice";
import { STORAGE_BUDGET_CHARS, useStorageHealth, usageRatio, WARN_AT } from "@/store/storageHealth";
import { cn } from "@/lib/cn";

/** Bills older than this can be archived (kept 2 years so "last year" comparisons still work). */
const ARCHIVE_AFTER_YEARS = 2;

/** Export, backup, restore and archive — keeps browser storage healthy and data safe. */
export function DataTools({ filtered, rangeLabel }: { filtered: Bill[]; rangeLabel: string }) {
  const state = useAppSelector(selectPos);
  const dispatch = useAppDispatch();
  const health = useStorageHealth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const ratio = usageRatio(health);
  const cutoff = new Date(new Date().getFullYear() - ARCHIVE_AFTER_YEARS, new Date().getMonth(), 1).getTime();
  const archivable = state.bills.filter((b) => b.createdAt < cutoff);
  const sampleCount = state.bills.filter((b) => b.demo).length;

  const exportCsv = () => downloadFile(`eatinghub-bills-${rangeLabel.toLowerCase().replace(/\s+/g, "-")}-${stamp()}.csv`, billsToCsv(filtered), "text/csv;charset=utf-8");
  const backup = () => downloadFile(`eatinghub-backup-${stamp()}.json`, JSON.stringify(state), "application/json");

  const restore = async (file: File) => {
    try {
      const next = normalizeState(JSON.parse(await file.text()));
      if (!next) throw new Error("not an EatingHUB backup");
      if (!confirm(`Replace all current data with this backup (${count(next.bills.length)} bills, ${next.tables.length} tables)?`)) return;
      dispatch(replace(next));
      setMessage({ tone: "ok", text: `Restored ${count(next.bills.length)} bills from ${file.name}.` });
    } catch (e) {
      setMessage({ tone: "error", text: `Couldn’t restore: ${e instanceof Error ? e.message : "invalid file"}.` });
    }
  };

  const archive = () => {
    if (!confirm(`Download ${archivable.length} bills older than ${ARCHIVE_AFTER_YEARS} years, then remove them from this device?`)) return;
    downloadFile(`eatinghub-archive-before-${stamp(new Date(cutoff))}.json`, JSON.stringify({ bills: archivable }), "application/json");
    dispatch(archiveBills({ before: cutoff }));
    setMessage({ tone: "ok", text: `Archived ${archivable.length} bills. Keep the downloaded file safe.` });
  };

  return (
    <section className="card p-4" aria-labelledby="data-h">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="data-h" className="font-bold">Data & backup</h2>
          <p className="text-xs text-muted">Bills are stored in this browser only — back up regularly.</p>
        </div>
        <div className="min-w-48 flex-1 sm:max-w-64">
          <div className="flex justify-between text-xs text-muted">
            <span>Storage used</span>
            <span className="tabular-nums">{Math.round(ratio * 100)}% of ~{Math.round(STORAGE_BUDGET_CHARS / 1_000_000)} MB</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className={cn("h-full rounded-full", ratio >= WARN_AT ? "bg-rose-500" : "bg-brand-600")} style={{ width: `${Math.max(2, ratio * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        <button className="btn btn-ghost" onClick={exportCsv} disabled={!filtered.length}><FileSpreadsheet className="size-4" /> Export CSV</button>
        <button className="btn btn-ghost" onClick={backup}><DatabaseBackup className="size-4" /> Backup</button>
        <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}><Upload className="size-4" /> Restore</button>
        <button className="btn btn-ghost" onClick={archive} disabled={!archivable.length} title={archivable.length ? undefined : `No bills older than ${ARCHIVE_AFTER_YEARS} years`}>
          <Archive className="size-4" /> Archive old
        </button>
        {/* Always rendered (disabled when empty) so the layout never shifts after load. */}
        <button
          className="btn btn-ghost"
          disabled={!sampleCount}
          onClick={() => confirm(`Remove ${sampleCount} sample bills? Your real bills are kept.`) && dispatch(removeDemoBills())}
        >
          <Trash2 className="size-4" /> Remove samples
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) restore(f);
          e.target.value = "";
        }}
      />
      {message && (
        <p role="status" className={cn("mt-3 rounded-xl p-3 text-sm", message.tone === "ok" ? "bg-brand-soft text-brand-800 dark:text-brand-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300")}>
          {message.text}
        </p>
      )}
    </section>
  );
}
