import type { Bill } from "@/types/pos";

export const CSV_COLUMNS = [
  "Bill no.",
  "Date",
  "Time",
  "Table",
  "Guests",
  "Payment",
  "Items",
  "Subtotal",
  "Discount",
  "Taxable value",
  "CGST",
  "SGST",
  "Round off",
  "Total",
] as const;

/** RFC 4180 quoting: wrap in quotes when needed, double any quotes inside. */
export function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** One row per bill, ready for Excel / Google Sheets / an accountant. */
export function billsToCsv(bills: Bill[]): string {
  const rows = bills.map((b) => {
    const d = new Date(b.createdAt);
    const t = b.totals;
    return [
      b.number,
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      b.tableName,
      b.guests,
      b.payment,
      t.itemCount,
      t.subtotal.toFixed(2),
      t.discount.toFixed(2),
      t.taxable.toFixed(2),
      t.cgst.toFixed(2),
      t.sgst.toFixed(2),
      t.roundOff.toFixed(2),
      t.total.toFixed(2),
    ];
  });
  return [CSV_COLUMNS, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

/** Trigger a browser download. The BOM makes Excel open UTF-8 (₹, names) correctly. */
export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([type.startsWith("text/csv") ? "﻿" + content : content], { type });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const stamp = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
