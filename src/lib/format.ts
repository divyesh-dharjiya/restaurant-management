const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const inrWhole = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inrCompact = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", notation: "compact", maximumFractionDigits: 1 });
const num = new Intl.NumberFormat("en-IN");

/** ₹1,234.50 */
export const money = (n: number) => inr.format(n);
/** ₹1,235 */
export const moneyWhole = (n: number) => inrWhole.format(n);
/** ₹1.2L — for chart axes */
export const moneyCompact = (n: number) => inrCompact.format(n);
export const count = (n: number) => num.format(n);
export const signedPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

export function elapsed(from: number, now: number) {
  const m = Math.max(0, Math.floor((now - from) / 60_000));
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

export const dateTime = (ts: number | string) =>
  new Date(ts).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export const bookingTime = (at: string) =>
  new Date(at).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** Format a Date for <input type="datetime-local">. */
export function toLocalInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** YYYYMMDD, used in invoice numbers. */
export const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
