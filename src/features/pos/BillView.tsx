"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Printer, ReceiptText } from "lucide-react";
import type { PaymentMode } from "@/types/pos";
import { computeBill } from "@/lib/billing";
import { money } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSession, selectTable } from "@/store/selectors";
import { reopenTable, settleBill } from "@/store/slices/posSlice";
import { EmptyState } from "@/components/ui";
import { Invoice } from "@/features/bills/Invoice";
import { PaymentPicker } from "./PaymentPicker";
import { routes } from "@/config/site";

export function BillView({ id }: { id: string }) {
  const table = useAppSelector(selectTable(id));
  const session = useAppSelector(selectSession(id));
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentMode>("UPI");
  const [settled, setSettled] = useState<{ billId: string; total: number; tableName: string } | null>(null);
  const [now] = useState(() => Date.now());

  if (settled) return <PaymentDone {...settled} payment={payment} />;

  if (!table || !session?.cart.length) {
    return (
      <EmptyState icon={ReceiptText} title="No open order for this table">
        <Link href={routes.floor} className="font-semibold text-brand-700 underline dark:text-brand-400">Back to floor</Link>
      </EmptyState>
    );
  }

  const totals = computeBill(session.cart, session.discountPct);
  const settle = () => {
    const action = settleBill(id, payment);
    setSettled({ billId: action.payload.id, total: totals.total, tableName: table.name });
    dispatch(action);
  };

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-[1fr_360px]">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-surface-2 p-4 sm:p-8">
        <Invoice number="DRAFT" tableName={table.name} guests={session.guests} createdAt={now} totals={totals} />
      </motion.div>

      <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card order-first space-y-5 p-5 lg:sticky lg:top-20 lg:order-none print:hidden">
        <button
          onClick={() => {
            dispatch(reopenTable(id));
            router.push(routes.table(id));
          }}
          className="flex items-center gap-2 text-sm text-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" /> Back to order
        </button>

        <div>
          <div className="text-sm text-muted">{table.name} · amount due</div>
          <div className="text-4xl font-extrabold tracking-tight tabular-nums">{money(totals.total)}</div>
          <div className="mt-1 text-xs text-muted">incl. {money(totals.cgst + totals.sgst)} GST</div>
        </div>

        <PaymentPicker value={payment} onChange={setPayment} />

        <div className="grid gap-2">
          <button onClick={() => window.print()} className="btn btn-ghost h-12"><Printer className="size-4" /> Print bill</button>
          <button onClick={settle} className="btn btn-primary h-12"><CheckCircle2 className="size-4" /> Settle & free table</button>
        </div>
      </motion.aside>
    </div>
  );
}

function PaymentDone({ billId, total, tableName, payment }: { billId: string; total: number; tableName: string; payment: PaymentMode }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card mx-auto mt-10 max-w-md p-8 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
        className="mx-auto grid size-16 place-items-center rounded-full bg-brand-soft text-brand-700 dark:text-brand-400"
      >
        <CheckCircle2 className="size-8" />
      </motion.div>
      <h1 className="mt-4 text-xl font-extrabold">Payment received</h1>
      <p className="mt-1 text-muted">{money(total)} via {payment} · {tableName} is now free</p>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <Link href={routes.invoice(billId)} className="btn btn-ghost"><ReceiptText className="size-4" /> View invoice</Link>
        <Link href={routes.floor} className="btn btn-primary">Back to floor</Link>
      </div>
    </motion.div>
  );
}
