import type { Metadata } from "next";
import { site } from "@/config/site";
import { HomePage } from "@/features/home/HomePage";

export const dynamic = "force-static";

const title = `${site.name} — ${site.tagline}`;
const shareImage = { url: "/opengraph-image", width: 1200, height: 630, alt: title };

export const metadata: Metadata = {
  title: { absolute: title },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: site.name, locale: site.locale, title, description: site.description, url: "/", images: [shareImage] },
  twitter: { card: "summary_large_image", title, description: site.description, images: [shareImage.url] },
};

export default function Home() {
  return <HomePage />;
}
