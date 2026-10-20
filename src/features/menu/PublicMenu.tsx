import { site } from "@/config/site";
import { items } from "@/lib/catalog";
import { BackToTop } from "@/components/ui/BackToTop";
import { PureVeg } from "@/components/ui/PureVeg";
import { MenuItemCard } from "./MenuItemCard";
import { jsonLdScript, menuByCategory, menuJsonLd } from "./structuredData";

/** Public, fully server-rendered menu page content. */
export function PublicMenu() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(menuJsonLd()) }} />

      <header className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-accent-400/15 blur-3xl" />
        <PureVeg />
        <h1 className="relative mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
          The <span className="text-brand-700 dark:text-brand-400">{site.name}</span> menu
        </h1>
        <p className="relative mt-2 max-w-2xl text-muted">
          {items.length} pure vegetarian dishes across {menuByCategory.length} categories, freshly prepared. Jain options available. Prices exclusive of GST.
        </p>
      </header>

      <nav aria-label="Menu sections" className="sticky top-16 z-20 -mx-4 mt-4 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <ul className="scrollbar-none fade-x flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible md:[mask-image:none]">
          {menuByCategory.map((c) => (
            <li key={c.id} className="shrink-0">
              <a href={`#${c.id}`} className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap text-muted transition hover:border-brand-500/50 hover:text-fg">
                <span aria-hidden>{c.emoji}</span>
                {c.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 space-y-12">
        {menuByCategory.map((c, ci) => (
          <section key={c.id} id={c.id} aria-labelledby={`h-${c.id}`} className="scroll-mt-36">
            <h2 id={`h-${c.id}`} className="mb-4 flex items-baseline gap-2 text-2xl font-extrabold tracking-tight">
              <span aria-hidden>{c.emoji}</span>
              {c.name}
              <span className="text-sm font-medium text-muted">{c.items.length} dishes</span>
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {c.items.map((item, ii) => <MenuItemCard key={item.id} item={item} priority={ci === 0 && ii < 3} />)}
            </ul>
          </section>
        ))}
      </div>

      <BackToTop />
    </>
  );
}
