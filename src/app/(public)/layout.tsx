import Link from "next/link";
import { routes, site } from "@/config/site";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const publicNav = [
  { href: routes.home, label: "Home" },
  { href: routes.menu, label: "Menu" },
];

/**
 * Customer-facing pages: no store, no animation library, server-rendered content.
 * A discreet "Staff" link leads to the PIN-locked POS.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
          <Logo href={routes.home} />
          <nav aria-label="Main" className="flex items-center gap-1">
            {publicNav.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-fg">
                {l.label}
              </Link>
            ))}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-5 sm:px-6">{children}</main>
      <footer className="border-t border-line py-6 text-center text-xs text-subtle">
        <p>© {site.name} · {site.tagline} · Dish photos via Wikimedia Commons contributors</p>
        <Link href={routes.floor} className="mt-2 inline-block underline underline-offset-2 hover:text-fg">Staff login</Link>
      </footer>
    </>
  );
}
