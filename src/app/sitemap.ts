import type { MetadataRoute } from "next";
import { routes, site } from "@/config/site";
import { HERO_IMAGE } from "@/features/home/content";
import { items } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}${routes.home}`, changeFrequency: "monthly", priority: 1, images: [`${site.url}${HERO_IMAGE.src}`] },
    { url: `${site.url}${routes.menu}`, changeFrequency: "weekly", priority: 0.9, images: items.map((i) => `${site.url}${i.image}`) },
  ];
}
