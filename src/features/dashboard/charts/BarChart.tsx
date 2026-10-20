"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { niceMax } from "@/lib/analytics";
import { useElementWidth } from "@/hooks/useElementWidth";
import type { Series } from "./ChartCard";

const M = { top: 8, right: 4, bottom: 26, left: 52 };
const GAP = 2; // surface gap between adjacent bars

/** Bar with 4px rounded data-end, anchored to the baseline. */
function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

type Props = { categories: string[]; series: Series[]; format: (n: number) => string; axisFormat?: (n: number) => string; height?: number };

/** Vertical (grouped) bar chart with a per-group hover tooltip. */
export function BarChart({ categories, series, format, axisFormat = format, height = 260 }: Props) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = height - M.top - M.bottom;
  const max = niceMax(Math.max(0, ...series.flatMap((s) => s.values)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const band = plotW / categories.length;
  const inner = band * (series.length > 1 ? 0.78 : 0.6);
  const barW = Math.max(2, (inner - GAP * (series.length - 1)) / series.length);
  const y = (v: number) => M.top + plotH - (v / max) * plotH;
  const labelEvery = band < 30 ? 2 : 1;

  return (
    <div ref={ref} className="relative w-full min-w-0" onMouseLeave={() => setHover(null)}>
      <svg width={width} height={height} className="block overflow-visible" role="img" aria-label={`Bar chart: ${series.map((s) => s.name).join(" vs ")}`}>
        {/* Recessive grid + y axis labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} className="stroke-grid" strokeWidth={1} />
            <text x={M.left - 8} y={y(t)} dominantBaseline="central" textAnchor="end" className="fill-subtle text-[11px] tabular-nums">{axisFormat(t)}</text>
          </g>
        ))}

        {categories.map((c, i) => {
          const gx = M.left + i * band;
          const x0 = gx + (band - inner) / 2;
          return (
            <g key={c}>
              {hover === i && <rect x={gx + 2} y={M.top} width={band - 4} height={plotH} rx={6} className="fill-surface-2" />}
              {series.map((s, j) => {
                const v = s.values[i] ?? 0;
                if (v <= 0) return null;
                const top = y(v);
                return (
                  <motion.path
                    key={s.name}
                    d={barPath(x0 + j * (barW + GAP), top, barW, M.top + plotH - top)}
                    fill={s.color}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1, opacity: hover === null || hover === i ? 1 : 0.55 }}
                    transition={{ scaleY: { duration: 0.6, delay: i * 0.03, ease: [0.2, 0.8, 0.2, 1] }, opacity: { duration: 0.15 } }}
                    style={{ originY: 1 }}
                  />
                );
              })}
              {i % labelEvery === 0 && (
                <text x={gx + band / 2} y={height - 8} textAnchor="middle" className="fill-muted text-[11px]">{c}</text>
              )}
              {/* Hit target: the whole column, bigger than the bars */}
              <rect
                x={gx}
                y={M.top}
                width={band}
                height={plotH}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${c}: ${series.map((s) => `${s.name} ${format(s.values[i] ?? 0)}`).join(", ")}`}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="outline-none"
              />
            </g>
          );
        })}
        <line x1={M.left} x2={width - M.right} y1={M.top + plotH} y2={M.top + plotH} className="stroke-line" strokeWidth={1} />
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-card"
          style={{ left: Math.min(Math.max(M.left + (hover + 0.5) * band, 80), width - 80), top: 0 }}
          role="status"
        >
          <div className="mb-1 font-semibold">{categories[hover]}</div>
          {series.map((s) => (
            <div key={s.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted"><span className="size-2 rounded-sm" style={{ background: s.color }} />{s.name}</span>
              <span className="font-semibold tabular-nums">{format(s.values[hover] ?? 0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
