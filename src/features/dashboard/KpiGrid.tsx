import { IndianRupee, Landmark, ReceiptText, Users } from "lucide-react";
import { change, type Summary } from "@/lib/analytics";
import { count, moneyWhole } from "@/lib/format";
import { StatCard } from "@/components/ui";

export function KpiGrid({ cur, prev, compareLabel }: { cur: Summary; prev: Summary; compareLabel: string }) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Key figures">
      <StatCard label="Revenue" value={moneyWhole(cur.revenue)} icon={IndianRupee} iconClass="text-brand-700 dark:text-brand-400" delta={change(cur.revenue, prev.revenue)} compareLabel={compareLabel} />
      <StatCard label="Bills" value={count(cur.count)} icon={ReceiptText} iconClass="text-sky-600 dark:text-sky-400" delta={change(cur.count, prev.count)} compareLabel={compareLabel} />
      <StatCard label="Average bill" value={moneyWhole(cur.avg)} icon={Users} iconClass="text-accent-600 dark:text-accent-400" delta={change(cur.avg, prev.avg)} compareLabel={compareLabel} />
      <StatCard label="GST collected" value={moneyWhole(cur.gst)} icon={Landmark} iconClass="text-violet-600 dark:text-violet-400" delta={change(cur.gst, prev.gst)} compareLabel={compareLabel} />
    </section>
  );
}
