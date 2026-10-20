"use client";

import { Armchair, CalendarClock, Flame, IndianRupee } from "lucide-react";
import { computeBill } from "@/lib/billing";
import { moneyWhole } from "@/lib/format";
import { useAppSelector, useIsClient } from "@/store/hooks";
import { selectPos } from "@/store/selectors";
import { StatCard } from "@/components/ui";
import { useNow } from "@/hooks/useNow";

export function FloorStats() {
  const { tables, sessions, bookings, bills } = useAppSelector(selectPos);
  const isClient = useIsClient();
  const now = useNow();

  const running = Object.values(sessions).reduce((s, o) => s + computeBill(o.cart, o.discountPct).total, 0);
  // "Today" depends on the viewer's clock, so only compute it in the browser.
  const today = isClient ? new Date().toDateString() : "";
  const endOfDay = new Date(now).setHours(23, 59, 59, 999);
  const bookingsToday = bookings.filter((b) => new Date(b.at).getTime() <= endOfDay).length;
  const todayRevenue = bills.filter((b) => new Date(b.createdAt).toDateString() === today).reduce((s, b) => s + b.totals.total, 0);

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Today at a glance">
      <StatCard label="Occupied tables" value={`${Object.keys(sessions).length}/${tables.length}`} icon={Armchair} iconClass="text-sky-600 dark:text-sky-400" />
      <StatCard label="Reservations today" value={isClient ? bookingsToday : "—"} icon={CalendarClock} iconClass="text-violet-600 dark:text-violet-400" />
      <StatCard label="Running orders" value={moneyWhole(running)} icon={Flame} iconClass="text-accent-600 dark:text-accent-400" />
      <StatCard label="Today's revenue" value={isClient ? moneyWhole(todayRevenue) : "—"} icon={IndianRupee} iconClass="text-brand-700 dark:text-brand-400" />
    </section>
  );
}
