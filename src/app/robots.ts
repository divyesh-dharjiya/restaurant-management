import type { MetadataRoute } from "next";
import { privatePaths, site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: ["/menu"], disallow: privatePaths },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
