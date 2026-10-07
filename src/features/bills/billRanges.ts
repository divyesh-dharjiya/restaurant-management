import type { Bill } from "@/types/pos";
import { periodRanges, type Period } from "@/lib/analytics";

export type BillRange = "today" | Period | "all";

export const BILL_RANGES: { id: BillRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "month", label: "This month" },
  { id: "quarter", label: "Quarter" },
  { id: "year", label: "This year" },
  { id: "lastYear", label: "Last year" },
  { id: "all", label: "All" },
];

export function billsInRange(bills: Bill[], range: BillRange, now: Date): Bill[] {
  if (range === "all") return bills;
  if (range === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return bills.filter((b) => b.createdAt >= start);
  }
  const { current } = periodRanges(range, now);
  return bills.filter((b) => b.createdAt >= current.start && b.createdAt < (range === "lastYear" ? current.end : Infinity));
}
