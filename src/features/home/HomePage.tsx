import Link from "next/link";
import { getImageProps } from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { routes, site } from "@/config/site";
import { PureVeg } from "@/components/ui/PureVeg";
import { MenuItemCard } from "@/features/menu/MenuItemCard";
import { jsonLdScript, siteEntities } from "@/features/menu/structuredData";
import { HERO_IMAGE, faqs, featuredDishes, highlights } from "./content";

/** Public landing page. Fully server-rendered, no client JS beyond the theme toggle. */
export function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(homeJsonLd()) }} />
      <Hero />
      <Highlights />
      <FeaturedDishes />
      <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <OpeningHours />
        <Faq />
      </div>
    </>
  );
}

function Hero() {
  const { props: img } = getImageProps({ src: HERO_IMAGE.src, alt: HERO_IMAGE.alt, width: 720, height: 540, sizes: "(min-width:1024px) 45vw, 100vw", quality: 70, preload: true, fetchPriority: "high", loading: "eager" });
  return (
    <section className="relative grid items-center gap-8 overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-10 lg:grid-cols-2" aria-labelledby="hero-h">
      <div className="pointer-events-none absolute -left-20 -top-24 size-96 glow-brand" />
      <div className="relative">
        <PureVeg />
        <h1 id="hero-h" className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Honest vegetarian food, <span className="text-brand-700 dark:text-brand-400">made fresh</span> every day.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">{site.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={routes.menu} className="btn btn-primary h-12 px-6 text-base">
            See the menu <ArrowRight className="size-4" />
          </Link>
          <a href="#hours" className="btn btn-ghost h-12 px-6 text-base">
            <Clock className="size-4" /> Opening hours
          </a>
        </div>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- optimised via getImageProps, no hydration */}
        <img {...img} alt={HERO_IMAGE.alt} className="size-full object-cover" />
      </div>
    </section>
  );
}

function Highlights() {
  return (
    <section className="mt-14" aria-labelledby="why-h">
      <h2 id="why-h" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Why guests come back</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((h) => (
          <li key={h.title} className="card p-5">
            <span className="text-3xl" aria-hidden>{h.emoji}</span>
            <h3 className="mt-3 font-bold">{h.title}</h3>
            <p className="mt-1 text-sm text-muted">{h.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FeaturedDishes() {
  return (
    <section className="mt-14" aria-labelledby="fav-h">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="fav-h" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Guest favourites</h2>
        <Link href={routes.menu} className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400">
          Full menu <ArrowRight className="size-4" />
        </Link>
      </div>
      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featuredDishes.map((item) => <MenuItemCard key={item.id} item={item} />)}
      </ul>
    </section>
  );
}

function OpeningHours() {
  return (
    <section id="hours" className="card scroll-mt-24 p-6" aria-labelledby="hours-h">
      <h2 id="hours-h" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
        <Clock className="size-5 text-brand-700 dark:text-brand-400" /> Opening hours
      </h2>
      <dl className="mt-4 divide-y divide-line">
        {site.hours.map((h) => (
          <div key={h.days} className="flex justify-between gap-4 py-3">
            <dt className="text-muted">{h.days}</dt>
            <dd className="font-semibold tabular-nums">{h.open} – {h.close}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-subtle">Kitchen takes last orders 30 minutes before closing.</p>
    </section>
  );
}

function Faq() {
  return (
    <section className="card p-6" aria-labelledby="faq-h">
      <h2 id="faq-h" className="text-xl font-extrabold tracking-tight">Questions guests ask</h2>
      <div className="mt-3 divide-y divide-line">
        {faqs.map((f) => (
          <details key={f.q} className="group py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="text-subtle transition group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="mt-2 text-sm text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...siteEntities(),
      {
        "@type": "FAQPage",
        "@id": `${site.url}/#faq`,
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
}
