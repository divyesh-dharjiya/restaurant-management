import type { Table } from "@/types/pos";

export const normName = (s: string) => s.trim().toLowerCase();

/** First "Table N" that isn't taken, so the default never clashes after tables are removed. */
export function nextTableName(tables: Pick<Table, "name">[]) {
  const taken = new Set(tables.map((t) => normName(t.name)));
  for (let n = tables.length + 1; ; n++) if (!taken.has(`table ${n}`)) return `Table ${n}`;
}

/** True when another table (not `selfId`) already uses this name, ignoring case and spaces. */
export const nameTaken = (tables: Pick<Table, "id" | "name">[], name: string, selfId?: string) => tables.some((t) => t.id !== selfId && normName(t.name) === normName(name));
