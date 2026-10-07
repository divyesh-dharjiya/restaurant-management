import type { Metadata } from "next";
import { site } from "@/config/site";
import { items } from "@/lib/catalog";
import { PublicMenu } from "@/features/menu/PublicMenu";

export const dynamic = "force-static";

const shareImage = { url: "/opengraph-image", width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` };

const description = `Explore ${items.length}+ pure vegetarian dishes at ${site.name} — starters, Gujarati & Punjabi thalis, South Indian, Indo-Chinese, pizza, desserts and drinks. Jain options available.`;

export const metadata: Metadata = {
  title: "Menu",
  description,
  alternates: { canonical: "/menu" },
  // Page-level openGraph replaces the root one, so the share image is repeated here.
  openGraph: { type: "website", siteName: site.name, locale: site.locale, title: `${site.name} Menu`, description, url: "/menu", images: [shareImage] },
  twitter: { card: "summary_large_image", title: `${site.name} Menu`, description, images: [shareImage.url] },
};

export default function MenuPage() {
  return <PublicMenu />;
}
