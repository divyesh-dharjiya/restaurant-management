import { BarChart3, ChefHat, ClipboardList, LayoutGrid, ReceiptText, type LucideIcon } from "lucide-react";

export const site = {
  name: "EatingHUB",
  tagline: "Pure Vegetarian Kitchen",
  description:
    "EatingHUB is a pure vegetarian kitchen serving North Indian, Gujarati, South Indian, Indo-Chinese, pizza, desserts and more — with Jain options on request.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_IN",
  keywords: ["EatingHUB", "pure veg restaurant", "vegetarian food", "Jain food", "Gujarati thali", "North Indian", "South Indian", "Indo-Chinese"],
  /** Shown on the public home page and in structured data. Demo values. */
  hours: [
    { days: "Monday – Friday", open: "11:30", close: "23:00", dayCodes: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
    { days: "Saturday – Sunday", open: "09:00", close: "23:30", dayCodes: ["Saturday", "Sunday"] },
  ],
} as const;

/** Every internal path in one place, so a route move is a one-line change. */
export const routes = {
  home: "/",
  menu: "/menu",
  floor: "/pos",
  table: (id: string) => `/pos/table/${encodeURIComponent(id)}`,
  bill: (id: string) => `/pos/table/${encodeURIComponent(id)}/bill`,
  kitchen: "/pos/kitchen",
  dashboard: "/pos/dashboard",
  bills: "/pos/bills",
  invoice: (billId: string) => `/pos/bills?id=${encodeURIComponent(billId)}`,
  menuManager: "/pos/menu",
} as const;

export type NavLink = { href: string; label: string; icon: LucideIcon; match: (path: string) => boolean };

export const navLinks: NavLink[] = [
  { href: routes.floor, label: "Floor", icon: LayoutGrid, match: (p) => p === routes.floor || p.startsWith("/pos/table") },
  { href: routes.kitchen, label: "Kitchen", icon: ChefHat, match: (p) => p.startsWith(routes.kitchen) },
  { href: routes.dashboard, label: "Dashboard", icon: BarChart3, match: (p) => p.startsWith(routes.dashboard) },
  { href: routes.bills, label: "Bills", icon: ReceiptText, match: (p) => p.startsWith(routes.bills) },
  { href: routes.menuManager, label: "Menu", icon: ClipboardList, match: (p) => p.startsWith(routes.menuManager) },
];

/** Staff-only screens: kept out of search results. */
export const privatePaths = ["/pos"];
