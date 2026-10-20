import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

/** Bowl + saffron leaf mark. Inline SVG so it renders without an extra request. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-9 shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#065f46" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logo-g)" />
      <path d="M33 29c0-9 6-15 15-15 0 9-6 15-15 15z" fill="#fbbf24" />
      <path d="M32 29c-1-5-4-8-9-9" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M13 33h38a19 19 0 0 1-38 0z" fill="#fff" />
      <path d="M10 33h44" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = "/", showTagline = true }: { href?: string; showTagline?: boolean }) {
  return (
    <Link href={href} className="group flex shrink-0 items-center gap-2 sm:gap-2.5" aria-label={`${site.name} — home`}>
      <LogoMark className="size-8 transition group-hover:rotate-[-6deg] group-hover:scale-105 sm:size-9" />
      {/* Wordmark hides on very narrow phones (<370px) so the nav fits. */}
      <span className="hidden leading-tight min-[370px]:block">
        <span className="block text-lg font-extrabold tracking-tight">
          Eating<span className="text-brand-600 dark:text-brand-400">HUB</span>
        </span>
        {showTagline && <span className="hidden text-[11px] font-medium text-muted sm:block">{site.tagline}</span>}
      </span>
    </Link>
  );
}
