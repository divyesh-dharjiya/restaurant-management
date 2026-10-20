"use client";

import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  MONTHS,
  PERIODS,
  QUARTERS,
  WEEKDAYS,
  categoryRevenue,
  inRange,
  monthlyRevenue,
  paymentSplit,
  periodRanges,
  quarterlyRevenue,
  summarize,
  topDishes,
  weekdayRevenue,
  type Period,
} from "@/lib/analytics";
import { moneyCompact, moneyWhole } from "@/lib/format";
import { useAppSelector, useIsClient } from "@/store/hooks";
import { selectSalesBills } from "@/store/selectors";
import { EmptyState, PageHeader, Segmented } from "@/components/ui";
import { BarChart } from "./charts/BarChart";
import { BarList } from "./charts/BarList";
import { ChartCard, Legend } from "./charts/ChartCard";
import { ShareBar } from "./charts/ShareBar";
import { KpiGrid } from "./KpiGrid";
import { RecentBills } from "./RecentBills";
import { YearComparison } from "./YearComparison";

const THIS_YEAR = "var(--series-1)";
const LAST_YEAR = "var(--series-2)";
const PAYMENT_COLORS = { UPI: "var(--series-1)", Card: "var(--series-2)", Cash: "var(--series-3)" } as const;

export function DashboardView() {
  const isClient = useIsClient();
  const [period, setPeriod] = useState<Period>("month");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Sales, GST and best-sellers at a glance"
        actions={<Segmented value={period} onChange={setPeriod} options={PERIODS} layoutId="period-tab" label="Period" wrap />}
      />
      {/* Every figure depends on the viewer's clock, so render after hydration. */}
      {isClient ? <DashboardBody period={period} /> : <DashboardSkeleton />}
    </div>
  );
}

function DashboardBody({ period }: { period: Period }) {
  const bills = useAppSelector(selectSalesBills);
  // Year-level series don't change when the period tab changes.
  const yearly = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    return {
      year,
      monthly: [monthlyRevenue(bills, year), monthlyRevenue(bills, year - 1)],
      quarterly: [quarterlyRevenue(bills, year), quarterlyRevenue(bills, year - 1)],
      thisYear: summarize(inRange(bills, periodRanges("year", now).current)),
      lastYear: summarize(inRange(bills, periodRanges("lastYear", now).current)),
    };
  }, [bills]);

  const selected = useMemo(() => {
    const { current, previous } = periodRanges(period, new Date());
    const cur = inRange(bills, current);
    return {
      current,
      previous,
      summary: summarize(cur),
      prevSummary: summarize(inRange(bills, previous)),
      dishes: topDishes(cur, 8),
      categories: categoryRevenue(cur),
      payments: paymentSplit(cur),
      weekdays: weekdayRevenue(cur),
    };
  }, [bills, period]);

  const data = { ...yearly, ...selected };

  if (!bills.length) return <EmptyState icon={BarChart3} title="No bills yet">Settle a bill and your sales will show up here.</EmptyState>;

  const yearSeries = (values: number[][]) => [
    { name: String(data.year), color: THIS_YEAR, values: values[0] },
    { name: String(data.year - 1), color: LAST_YEAR, values: values[1] },
  ];
  const yearLegend = <Legend items={yearSeries(data.monthly)} />;

  return (
    <>
      <p className="-mt-2 text-sm text-muted">
        Showing <b className="font-semibold text-fg">{data.current.label}</b> compared with {data.previous.label}.
      </p>

      <KpiGrid cur={data.summary} prev={data.prevSummary} compareLabel={data.previous.label} />

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Monthly revenue"
          subtitle={`${data.year} vs ${data.year - 1}, incl. GST`}
          legend={yearLegend}
          table={{ columns: ["Month", String(data.year), String(data.year - 1)], rows: MONTHS.map((m, i) => [m, moneyWhole(data.monthly[0][i]), moneyWhole(data.monthly[1][i])]) }}
        >
          <BarChart categories={MONTHS} series={yearSeries(data.monthly)} format={moneyWhole} axisFormat={moneyCompact} />
        </ChartCard>

        <ChartCard
          title="Quarterly revenue"
          subtitle="Calendar quarters"
          legend={yearLegend}
          table={{ columns: ["Quarter", String(data.year), String(data.year - 1)], rows: QUARTERS.map((q, i) => [q, moneyWhole(data.quarterly[0][i]), moneyWhole(data.quarterly[1][i])]) }}
        >
          <BarChart categories={QUARTERS} series={yearSeries(data.quarterly)} format={moneyWhole} axisFormat={moneyCompact} />
        </ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Payment methods" subtitle={data.current.label}>
          <ShareBar parts={data.payments.map((p) => ({ name: p.mode, color: PAYMENT_COLORS[p.mode], value: p.value, detail: `${p.count} bills` }))} format={moneyWhole} />
        </ChartCard>
        <ChartCard title="Top dishes" subtitle={`By sales value · ${data.current.label}`}>
          <BarList rows={data.dishes} format={moneyWhole} />
        </ChartCard>
        <ChartCard title="Sales by category" subtitle={`Before GST · ${data.current.label}`}>
          <BarList rows={data.categories.slice(0, 8)} format={moneyWhole} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Busiest days" subtitle={`Revenue by weekday · ${data.current.label}`}>
          <BarChart categories={WEEKDAYS} series={[{ name: "Revenue", color: THIS_YEAR, values: data.weekdays }]} format={moneyWhole} axisFormat={moneyCompact} height={220} />
        </ChartCard>
        <ChartCard title="Year over year" subtitle={`${data.year - 1} full year vs ${data.year} to date`}>
          <YearComparison year={data.year} thisYear={data.thisYear} lastYear={data.lastYear} />
        </ChartCard>
        <ChartCard title="Recent bills">
          <RecentBills bills={bills.slice(0, 5)} />
        </ChartCard>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="skeleton h-80 rounded-2xl lg:col-span-2" />
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    </div>
  );
}
