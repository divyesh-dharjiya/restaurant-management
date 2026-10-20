import { categories, items, popularItems } from "@/lib/catalog";

export const HERO_IMAGE = { src: "/menu/thali-special-gujarati.jpg", alt: "A Gujarati thali with dal, kadhi, sabzi, rotis, rice and sweets" };

/** Six bestsellers spread across categories, so the home page shows range rather than six curries. */
export const featuredDishes = (() => {
  const seen = new Set<string>();
  const picks = popularItems.filter((i) => !seen.has(i.categoryId) && seen.add(i.categoryId));
  return picks.slice(0, 6);
})();

export const highlights = [
  { emoji: "🌿", title: "100% pure vegetarian", body: "A strictly vegetarian kitchen. No eggs, no meat, no exceptions." },
  { emoji: "🙏", title: "Jain food on request", body: `${items.filter((i) => i.jain).length} dishes made without onion, garlic or root vegetables.` },
  { emoji: "🍛", title: `${items.length}+ dishes`, body: `${categories.length} sections, from Gujarati and Punjabi thalis to dosas, Indo-Chinese and wood-fired pizza.` },
  { emoji: "🧾", title: "Clear GST billing", body: "Itemised invoices with CGST and SGST shown, and no hidden service charge." },
] as const;

export const faqs = [
  { q: "Is EatingHUB fully vegetarian?", a: "Yes. The whole kitchen is pure vegetarian. We do not cook eggs, meat or fish." },
  { q: "Do you serve Jain food?", a: `Yes. ${items.filter((i) => i.jain).length} dishes are prepared Jain-style, without onion, garlic or root vegetables. Ask your server and the kitchen will confirm.` },
  { q: "Can I book a table?", a: "Yes. Ask at the counter or call ahead and we will hold a table for you. Bookings are held for 30 minutes past the booked time." },
  { q: "Are menu prices inclusive of GST?", a: "Menu prices are before GST. Food bills carry 5% GST (2.5% CGST and 2.5% SGST), shown separately on the invoice." },
  { q: "Which payment methods do you accept?", a: "Cash, UPI and all major debit and credit cards." },
] as const;
