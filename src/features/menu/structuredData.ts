import { site } from "@/config/site";
import { categories, items } from "@/lib/catalog";

export const menuByCategory = categories.map((c) => ({ ...c, items: items.filter((i) => i.categoryId === c.id) }));

/** Site-wide entities shared by every public page. No address/phone by design. */
export function siteEntities() {
  return [
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      inLanguage: "en-IN",
    },
    {
      "@type": "Restaurant",
      "@id": `${site.url}/#restaurant`,
      name: site.name,
      description: site.description,
      url: site.url,
      image: `${site.url}/opengraph-image`,
      servesCuisine: ["Indian", "Gujarati", "South Indian", "Indo-Chinese", "Italian"],
      priceRange: "₹₹",
      acceptsReservations: true,
      openingHoursSpecification: site.hours.map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.dayCodes, opens: h.open, closes: h.close })),
      hasMenu: { "@id": `${site.url}/menu#menu` },
    },
  ];
}

/** schema.org Restaurant + Menu, so search engines can show dishes and prices. */
export function menuJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...siteEntities(),
      {
        "@type": "Menu",
        "@id": `${site.url}/menu#menu`,
        name: `${site.name} Menu`,
        url: `${site.url}/menu`,
        hasMenuSection: menuByCategory.map((c) => ({
          "@type": "MenuSection",
          name: c.name,
          hasMenuItem: c.items.map((i) => ({
            "@type": "MenuItem",
            name: i.name,
            description: i.description,
            image: `${site.url}${i.image}`,
            suitableForDiet: "https://schema.org/VegetarianDiet",
            offers: { "@type": "Offer", price: i.price, priceCurrency: "INR" },
          })),
        })),
      },
    ],
  };
}

/** Serialise JSON-LD safely for an inline <script>. */
export const jsonLdScript = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
