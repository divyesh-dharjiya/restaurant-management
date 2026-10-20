import type { KitchenTicket, Session, TicketStatus } from "@/types/pos";
import { itemById } from "./catalog";

export type TicketLine = KitchenTicket["lines"][number];

/**
 * What the kitchen hasn't been told yet: new dishes and extra quantities as
 * positive lines, and dishes reduced or removed after sending as negative
 * (cancellation) lines.
 */
export function pendingLines(session: Pick<Session, "cart" | "sent">): TicketLine[] {
  const sent = session.sent ?? {};
  const lines: TicketLine[] = [];
  const inCart = new Set<string>();
  for (const l of session.cart) {
    inCart.add(l.itemId);
    const diff = l.qty - (sent[l.itemId] ?? 0);
    if (diff !== 0) lines.push({ itemId: l.itemId, name: itemById.get(l.itemId)?.name ?? l.itemId, qty: diff, ...(l.note && diff > 0 ? { note: l.note } : {}) });
  }
  for (const [itemId, qty] of Object.entries(sent)) {
    if (!inCart.has(itemId) && qty > 0) lines.push({ itemId, name: itemById.get(itemId)?.name ?? itemId, qty: -qty });
  }
  return lines;
}

/** Number of dishes (not lines) waiting to be sent, counting additions only. */
export const unsentCount = (session: Pick<Session, "cart" | "sent">) => pendingLines(session).reduce((s, l) => s + Math.max(0, l.qty), 0);

/** The sent-quantity map once everything in the cart has gone to the kitchen. */
export const sentSnapshot = (session: Pick<Session, "cart">): Record<string, number> => Object.fromEntries(session.cart.map((l) => [l.itemId, l.qty]));

export const TICKET_FLOW: TicketStatus[] = ["new", "preparing", "ready", "served"];

export const nextStatus = (s: TicketStatus): TicketStatus => TICKET_FLOW[Math.min(TICKET_FLOW.indexOf(s) + 1, TICKET_FLOW.length - 1)];

/** Served tickets are history; keep them for this long so the kitchen can look back over the shift. */
export const SERVED_TICKET_TTL_MS = 12 * 60 * 60_000;

export const pruneTickets = (tickets: KitchenTicket[], now: number) => tickets.filter((t) => t.status !== "served" || now - t.createdAt < SERVED_TICKET_TTL_MS);
