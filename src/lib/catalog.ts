import data from "@/data/menu.json";
import type { Table } from "@/types/pos";

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  image: string;
  popular?: boolean;
  spicy?: boolean;
  jain?: boolean;
  isNew?: boolean;
};
export type Category = (typeof data.categories)[number];

/** Legal/tax details printed on invoices. */
export const business = data.restaurant;
export const tax = data.tax;
/** Initial floor layout. Tables can be added/removed at runtime (kept in the store). */
export const seedTables: Table[] = data.tables;
export const categories: Category[] = data.categories;
export const items: MenuItem[] = data.items;

export const itemById = new Map(items.map((i) => [i.id, i]));
export const categoryById = new Map(categories.map((c) => [c.id, c]));
export const categoryCount = new Map(categories.map((c) => [c.id, items.filter((i) => i.categoryId === c.id).length]));
export const popularItems = items.filter((i) => i.popular);
