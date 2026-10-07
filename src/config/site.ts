import { BarChart3, BookOpen, LayoutGrid, ReceiptText, type LucideIcon } from "lucide-react";

export const site = {
  name: "EatingHUB",
  tagline: "Pure Vegetarian Kitchen",
  description:
    "EatingHUB is a pure vegetarian kitchen serving North Indian, Gujarati, South Indian, Indo-Chinese, pizza, desserts and more — with Jain options on request.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_IN",
  keywords: ["EatingHUB", "pure veg restaurant", "vegetarian food", "Jain food", "Gujarati thali", "North Indian", "South Indian", "Indo-Chinese"],
} as const;

export type NavLink = { href: string; label: string; icon: LucideIcon; match: (path: string) => boolean };

export const navLinks: NavLink[] = [
  { href: "/", label: "Floor", icon: LayoutGrid, match: (p) => p === "/" || p.startsWith("/table") },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3, match: (p) => p.startsWith("/dashboard") },
  { href: "/bills", label: "Bills", icon: ReceiptText, match: (p) => p.startsWith("/bills") },
  { href: "/menu", label: "Menu", icon: BookOpen, match: (p) => p.startsWith("/menu") },
];

/** Staff-only screens: kept out of search results. */
export const privatePaths = ["/table/", "/bills", "/dashboard"];
