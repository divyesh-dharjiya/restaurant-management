"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { navLinks, routes } from "@/config/site";
import { cn } from "@/lib/cn";
import { useAppSelector } from "@/store/hooks";
import { selectActiveCount } from "@/store/selectors";
import { ThemeToggle } from "@/components/ui";
import { Logo } from "./Logo";
import { NavPending } from "./NavPending";

export function Navbar() {
  const path = usePathname();
  const active = useAppSelector(selectActiveCount);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Logo href={routes.floor} />
        <nav className="ml-auto flex items-center gap-1 rounded-2xl border border-line bg-surface p-1" aria-label="Main">
          {navLinks.map(({ href, label, icon: Icon, match }) => {
            const on = match(path);
            return (
              <Link key={href} href={href} className="relative rounded-xl px-1.5 py-1.5 text-sm font-semibold min-[400px]:px-2 sm:px-3.5" aria-current={on ? "page" : undefined} title={label}>
                {on && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-brand-soft ring-1 ring-brand-600/25" transition={{ type: "spring", bounce: 0.2, duration: 0.45 }} />}
                <span className={cn("relative flex items-center gap-1 sm:gap-2", on ? "text-brand-800 dark:text-brand-300" : "text-muted hover:text-fg")}>
                  <span className="relative">
                    <Icon className="size-4" />
                    <NavPending />
                  </span>
                  <span className="hidden md:inline">{label}</span>
                  {href === routes.floor && active > 0 && <span className="rounded-full bg-accent-500 px-1.5 text-[10px] font-bold leading-4 text-amber-950">{active}</span>}
                </span>
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
