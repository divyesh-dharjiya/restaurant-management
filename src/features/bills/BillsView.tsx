"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, IndianRupee, Landmark, Printer, ReceiptText, Search, Trash2, Wallet } from "lucide-react";
import { summarize } from "@/lib/analytics";
import { count, moneyWhole } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectBills } from "@/store/selectors";
import { removeDemoBills } from "@/store/slices/posSlice";
import { EmptyState, Modal, PageHeader, Segmented, StatCard } from "@/components/ui";
import { BILL_RANGES, billsInRange, type BillRange } from "./billRanges";
import { BillsTable } from "./BillsTable";
import { Invoice } from "./Invoice";

const PAGE = 25;

export function BillsView() {
  const bills = useAppSelector(selectBills);
  const dispatch = useAppDispatch();
  const params = useSearchParams();
  const router = useRouter();
  const open = bills.find((b) => b.id === params.get("id"));
  const [range, setRange] = useState<BillRange>("month");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return billsInRange(bills, range, new Date()).filter((b) => !s || b.number.toLowerCase().includes(s) || b.tableName.toLowerCase().includes(s));
  }, [bills, range, q]);
  const sum = summarize(list);
  const hasDemo = bills.some((b) => b.demo);

  const openBill = (id: string) => router.replace(`/bills?id=${id}`, { scroll: false });
  const close = () => router.replace("/bills", { scroll: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bills"
        subtitle="Settled invoices with GST breakdown"
        actions={
          <>
            <div className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-brand-500">
              <Search className="size-4 text-subtle" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Bill no. or table" aria-label="Search bills" className="w-40 bg-transparent text-sm outline-none placeholder:text-subtle" />
            </div>
            {hasDemo && (
              <button className="btn btn-ghost" onClick={() => confirm("Remove all sample bills? Your real bills are kept.") && dispatch(removeDemoBills())}>
                <Trash2 className="size-4" /> Remove sample bills
              </button>
            )}
          </>
        }
      />

      <Segmented value={range} onChange={(r) => { setRange(r); setLimit(PAGE); }} options={BILL_RANGES} layoutId="bill-range" label="Date range" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Bills" value={count(sum.count)} icon={ReceiptText} iconClass="text-sky-600 dark:text-sky-400" />
        <StatCard label="Net sales" value={moneyWhole(sum.net)} icon={Wallet} iconClass="text-brand-700 dark:text-brand-400" />
        <StatCard label="GST collected" value={moneyWhole(sum.gst)} icon={Landmark} iconClass="text-violet-600 dark:text-violet-400" />
        <StatCard label="Gross total" value={moneyWhole(sum.revenue)} icon={IndianRupee} iconClass="text-accent-600 dark:text-accent-400" />
      </div>

      {list.length === 0 ? (
        <EmptyState icon={ReceiptText} title="No bills in this range" />
      ) : (
        <>
          <BillsTable bills={list.slice(0, limit)} onOpen={openBill} />
          {list.length > limit && (
            <div className="text-center">
              <button className="btn btn-ghost" onClick={() => setLimit((l) => l + PAGE)}>Show more ({list.length - limit} left)</button>
            </div>
          )}
        </>
      )}

      <Modal
        open={!!open}
        onClose={close}
        title={
          open && (
            <div className="flex items-center justify-between gap-2 pr-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-400"><CheckCircle2 className="size-4" /> Paid via {open.payment}</span>
              <button onClick={() => window.print()} className="btn btn-ghost h-9"><Printer className="size-4" /> Print</button>
            </div>
          )
        }
      >
        {open && (
          <div className="-m-5 bg-surface-2 p-5">
            <Invoice number={open.number} tableName={open.tableName} guests={open.guests} createdAt={open.createdAt} totals={open.totals} payment={open.payment} />
          </div>
        )}
      </Modal>
    </div>
  );
}
