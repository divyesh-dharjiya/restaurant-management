import { getImageProps } from "next/image";
import { Flame, Leaf, Sparkles } from "lucide-react";
import type { MenuItem } from "@/lib/catalog";
import { money } from "@/lib/format";

/** Server-rendered dish row for the public menu (no client JS). */
export function MenuItemCard({ item, priority }: { item: MenuItem; priority?: boolean }) {
  // getImageProps gives the optimised srcset of <Image> as a plain <img>,
  // so 245 photos add zero hydration work on this page.
  const { props: img } = getImageProps({ src: item.image, alt: item.name, width: 96, height: 96, sizes: "96px", quality: 70, priority });
  return (
    <li className="card cv-auto group flex gap-4 p-3 transition hover:-translate-y-0.5 hover:shadow-lg" style={{ containIntrinsicSize: "auto 120px" }}>
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- optimised via getImageProps */}
        <img {...img} alt={item.name} className="size-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-snug">{item.name}</h3>
          <span className="shrink-0 font-extrabold tabular-nums">{money(item.price)}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>
        <div className="mt-auto flex flex-wrap gap-1 pt-2 text-[11px] font-semibold">
          {item.popular && <span className="flex items-center gap-0.5 rounded-full bg-accent-soft px-2 py-0.5 text-accent-700 dark:text-accent-400"><Flame className="size-3" />Bestseller</span>}
          {item.isNew && <span className="flex items-center gap-0.5 rounded-full bg-violet-500/10 px-2 py-0.5 text-violet-700 dark:text-violet-300"><Sparkles className="size-3" />New</span>}
          {item.jain && <span className="flex items-center gap-0.5 rounded-full bg-brand-soft px-2 py-0.5 text-brand-800 dark:text-brand-300"><Leaf className="size-3" />Jain</span>}
          {item.spicy && <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-rose-700 dark:text-rose-400">🌶️ Spicy</span>}
        </div>
      </div>
    </li>
  );
}
