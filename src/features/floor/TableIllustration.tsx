"use client";

import { motion } from "motion/react";
import type { TableStatus } from "@/types/pos";
import { cn } from "@/lib/cn";
import { statusTheme } from "@/components/ui";

type Chair = { x: number; y: number; rot: number };

const W = 160;
const H = 104;
const CX = W / 2;
const CY = H / 2;

/** Round table for small parties, a long table for bigger ones. */
function layout(seats: number): { shape: "round" | "rect"; tableW: number; chairs: Chair[] } {
  if (seats <= 4) {
    const chairs = Array.from({ length: seats }, (_, i) => {
      const a = (i / seats) * Math.PI * 2 - Math.PI / 2;
      return { x: CX + Math.cos(a) * 38, y: CY + Math.sin(a) * 38, rot: (a * 180) / Math.PI + 90 };
    });
    return { shape: "round", tableW: 48, chairs };
  }
  const top = Math.ceil(seats / 2);
  const bottom = seats - top;
  const tableW = Math.min(140, top * 21 + 14);
  const x0 = CX - tableW / 2;
  const row = (n: number, y: number, rot: number) => Array.from({ length: n }, (_, i) => ({ x: x0 + ((i + 0.5) * tableW) / n, y, rot }));
  return { shape: "rect", tableW, chairs: [...row(top, CY - 27, 0), ...row(bottom, CY + 27, 180)] };
}

/** Short label for the table top: "Table 7" → "7", "Booth 2" → "B2". */
export function shortName(name: string) {
  const [first, ...rest] = name.trim().split(/\s+/);
  if (!rest.length) return name.slice(0, 3).toUpperCase();
  return /^table$/i.test(first) ? rest.join("") : first[0].toUpperCase() + rest.join("");
}

export function TableIllustration({ name, seats, filled, status, className, animateIn = true }: { name: string; seats: number; filled: number; status: TableStatus; className?: string; animateIn?: boolean }) {
  const { shape, tableW, chairs } = layout(seats);
  const busy = status === "ordering" || status === "billing";
  const active = status !== "free";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("w-full overflow-visible", statusTheme[status].ink, className)} role="img" aria-label={`${name}: ${filled} of ${seats} seats taken`}>
      {/* Pulse halo while an order is live */}
      {busy && (
        <motion.ellipse
          cx={CX}
          cy={CY}
          rx={shape === "round" ? 34 : tableW / 2 + 10}
          ry={shape === "round" ? 34 : 26}
          className="fill-current"
          initial={{ opacity: 0.25, scale: 0.9 }}
          animate={{ opacity: [0.22, 0, 0.22], scale: [0.92, 1.12, 0.92] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {chairs.map((c, i) => {
        const taken = i < filled;
        return (
          <motion.g
            key={i}
            initial={animateIn ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 + i * 0.04, type: "spring", bounce: 0.45, duration: 0.5 }}
          >
            <rect
              x={c.x - 8}
              y={c.y - 6}
              width={16}
              height={12}
              rx={4}
              transform={`rotate(${c.rot} ${c.x} ${c.y})`}
              strokeWidth={1.5}
              strokeDasharray={status === "reserved" && taken ? "3 2" : undefined}
              className={cn(
                "transition-[fill,stroke] duration-500",
                taken && status !== "reserved" ? "fill-current stroke-current" : taken ? "fill-transparent stroke-current" : "fill-surface-2 stroke-line",
              )}
            />
          </motion.g>
        );
      })}

      {/* Table top */}
      {shape === "round" ? (
        <circle cx={CX} cy={CY} r={24} strokeWidth={1.5} className={cn("transition-colors duration-500", active ? "fill-surface stroke-current" : "fill-surface stroke-line")} />
      ) : (
        <rect x={CX - tableW / 2} y={CY - 17} width={tableW} height={34} rx={10} strokeWidth={1.5} className={cn("transition-colors duration-500", active ? "fill-surface stroke-current" : "fill-surface stroke-line")} />
      )}
      <text x={CX} y={CY} dominantBaseline="central" textAnchor="middle" className={cn("text-[15px] font-extrabold", active ? "fill-current" : "fill-subtle")}>
        {shortName(name)}
      </text>

      {/* Rising steam while food is on the way */}
      {status === "ordering" &&
        [-8, 0, 8].map((dx, i) => (
          <motion.circle
            key={dx}
            cx={CX + dx}
            cy={CY - 14}
            r={2}
            className="fill-current"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.7, 0], y: -14 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.45, ease: "easeOut" }}
          />
        ))}
    </svg>
  );
}
