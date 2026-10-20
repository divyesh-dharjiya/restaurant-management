import Link from "next/link";
import { site } from "@/config/site";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Customer-facing pages: no store, no animation library, server-rendered content.
 * A single discreet "Staff floor" link lets staff using the same device get back
 * to the POS, since the menu page is otherwise a dead end.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
          <Logo href="/menu" />
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted hover:bg-surface-2 hover:text-fg">
              Staff floor →
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-5 sm:px-6">{children}</main>
      <footer className="border-t border-line py-6 text-center text-xs text-subtle">
        <p>© {site.name} · {site.tagline} · Dish photos via Wikimedia Commons contributors</p>
        <Link href="/" className="mt-2 inline-block underline underline-offset-2 hover:text-fg">Staff floor</Link>
      </footer>
    </>
  );
}
