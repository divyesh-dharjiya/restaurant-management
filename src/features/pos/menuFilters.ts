import { categories, categoryCount, items, popularItems, type MenuItem } from "@/lib/catalog";

export const ALL = "all";
export const POPULAR = "popular";

export type DietFilter = "spicy" | "jain" | "new";

export const DIET_FILTERS: { id: DietFilter; label: string; icon: string; test: (i: MenuItem) => boolean }[] = [
  { id: "spicy", label: "Spicy", icon: "🌶️", test: (i) => !!i.spicy },
  { id: "jain", label: "Jain", icon: "🌿", test: (i) => !!i.jain },
  { id: "new", label: "New", icon: "✨", test: (i) => !!i.isNew },
];

export type CategoryTab = { id: string; name: string; emoji: string; count: number };

export const CATEGORY_TABS: CategoryTab[] = [
  { id: POPULAR, name: "Bestsellers", emoji: "🔥", count: popularItems.length },
  { id: ALL, name: "All", emoji: "📖", count: items.length },
  ...categories.map((c) => ({ ...c, count: categoryCount.get(c.id) ?? 0 })),
];

/** Searching looks across the whole menu regardless of the selected category. */
export function filterMenu(category: string, diet: ReadonlySet<DietFilter>, query: string): MenuItem[] {
  const q = query.trim().toLowerCase();
  const tests = DIET_FILTERS.filter((f) => diet.has(f.id)).map((f) => f.test);
  return items.filter(
    (i) =>
      (q || category === ALL || (category === POPULAR ? i.popular : i.categoryId === category)) &&
      tests.every((t) => t(i)) &&
      (!q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)),
  );
}
