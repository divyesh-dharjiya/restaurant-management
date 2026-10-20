"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { splitEvenly } from "@/lib/billing";
import { moneyWhole } from "@/lib/format";
import { Stepper } from "@/components/ui";

/** Equal split calculator for the bill screen. Shares are whole rupees that add up to the total. */
export function SplitBill({ total, guests }: { total: number; guests: number }) {
  const [ways, setWays] = useState(1);
  const shares = splitEvenly(total, ways);
  const uneven = shares[0] !== shares[shares.length - 1];

  return (
    <section className="rounded-2xl border border-line p-3" aria-labelledby="split-h">
      <div className="flex items-center justify-between gap-2">
        <h3 id="split-h" className="flex items-center gap-1.5 text-sm font-semibold"><Users className="size-4 text-muted" /> Split equally</h3>
        <Stepper size="sm" qty={ways} label="people paying" onInc={() => setWays((w) => Math.min(50, w + 1))} onDec={() => setWays((w) => Math.max(1, w - 1))} />
      </div>
      {ways > 1 ? (
        <p className="mt-2 text-sm text-muted" aria-live="polite">
          {uneven ? (
            <>
              <b className="text-fg tabular-nums">{moneyWhole(shares[0])}</b> × {shares.filter((s) => s === shares[0]).length} and{" "}
              <b className="text-fg tabular-nums">{moneyWhole(shares[shares.length - 1])}</b> × {shares.filter((s) => s !== shares[0]).length}
            </>
          ) : (
            <>
              <b className="text-fg tabular-nums">{moneyWhole(shares[0])}</b> each, {ways} people
            </>
          )}
        </p>
      ) : (
        guests > 1 && (
          <button type="button" onClick={() => setWays(guests)} className="mt-2 text-xs font-semibold text-brand-700 underline underline-offset-2 dark:text-brand-400">
            Split between all {guests} guests
          </button>
        )
      )}
    </section>
  );
}
