// Downloads a real photo per menu item from Wikimedia Commons into public/menu and writes credits.
// Run: node scripts/fetch-images.mjs   (skips files that already exist)
import { readFileSync, existsSync, writeFileSync, statSync } from "node:fs";

const { items } = JSON.parse(readFileSync("src/data/menu.json", "utf8"));
const UA = { "User-Agent": "TableTapPOS/1.0 (restaurant demo project)" };
const creditsFile = "src/data/image-credits.json";
const credits = existsSync(creditsFile) ? JSON.parse(readFileSync(creditsFile, "utf8")) : {};
const used = new Set(Object.values(credits).map((c) => c.file));

const clean = (s) => s.replace(/\(.*?\)/g, "").replace(/\b(jain|special|platter|combo|basket|dry|gravy|mini|classic|plain|veg)\b/gi, "").replace(/\s+/g, " ").trim();
const queries = (item) => {
  const n = clean(item.name);
  const words = n.split(" ");
  return [...new Set([
    item.name.replace(/\(.*?\)/g, "").trim(),
    n,
    `${n} Indian food`,
    words.length > 1 ? words.slice(-2).join(" ") : "",
    words.length > 1 ? words.slice(-1)[0] : "",
    words.length > 1 ? words[0] : "",
  ].filter((q) => q.length > 2))];
};

const categoryFallback = {
  starters: ["Indian vegetarian appetizer", "Indian street food", "tandoori vegetarian"],
  soups: ["vegetable soup bowl", "Indian soup", "fresh salad bowl"],
  main: ["Indian vegetable curry", "Indian paneer curry", "Indian lentil curry", "Indian thali"],
  breads: ["Indian bread", "Indian flatbread", "paratha"],
  rice: ["Indian rice dish", "vegetable pulao", "biryani"],
  chinese: ["Indo-Chinese food", "vegetable noodles", "vegetable fried rice"],
  pizza: ["vegetarian pizza", "pasta dish", "veg burger", "sandwich"],
  southindian: ["South Indian breakfast", "dosa", "idli sambar"],
  desserts: ["Indian sweet dessert", "Indian mithai", "ice cream dessert"],
  beverages: ["Indian drink glass", "cold drink glass", "milkshake glass", "tea cup"],
};

async function search(q) {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q + " filetype:bitmap")}&gsrlimit=15&prop=imageinfo&iiprop=url|mime|size|extmetadata&iiurlwidth=640&format=json`;
  for (let a = 0; a < 4; a++) {
    try {
      const r = await fetch(u, { headers: UA, signal: AbortSignal.timeout(30_000) });
      if (r.status === 429) { await new Promise((r) => setTimeout(r, 3000 * (a + 1))); continue; }
      const j = await r.json();
      return Object.values(j.query?.pages ?? {}).sort((x, y) => x.index - y.index)
        .map((p) => ({ title: p.title, info: p.imageinfo?.[0] }))
        .filter(({ title, info }) => info && info.mime === "image/jpeg" && info.width >= 600 && info.width >= info.height * 0.95 && !used.has(title) && !/menu|logo|map|flag|diagram|recipe|stamp|poster|restaurant|shop|vendor|stall|market|people|man |woman/i.test(title));
    } catch { await new Promise((r) => setTimeout(r, 1500)); }
  }
  return [];
}

async function pick(item) {
  for (const q of queries(item)) {
    const hits = await search(q);
    if (hits.length) return hits[0];
  }
  for (const q of categoryFallback[item.categoryId] ?? []) {
    const hits = await search(q);
    if (hits.length) return { ...hits[0], fallback: true };
  }
  return null;
}

async function fetchOne(item) {
  const hit = await pick(item);
  if (!hit) return "none";
  used.add(hit.title);
  const res = await fetch(hit.info.thumburl, { headers: UA, signal: AbortSignal.timeout(60_000) });
  const buf = Buffer.from(await res.arrayBuffer());
  if (!res.ok || buf.length < 5000) { used.delete(hit.title); return "bad"; }
  writeFileSync(`public${item.image}`, buf);
  const m = hit.info.extmetadata ?? {};
  credits[item.id] = { file: hit.title, author: (m.Artist?.value ?? "").replace(/<[^>]+>/g, "").slice(0, 80), license: m.LicenseShortName?.value ?? "", page: hit.info.descriptionurl, fallback: !!hit.fallback };
  return hit.fallback ? "fallback" : "ok";
}

const todo = items.filter((i) => !existsSync(`public${i.image}`) || statSync(`public${i.image}`).size < 5000);
console.log(`${todo.length} images to fetch`);
const stats = { ok: 0, fallback: 0, none: 0, bad: 0 };
const queue = [...todo];
let n = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) {
    const item = queue.shift();
    let r;
    try { r = await fetchOne(item); } catch (e) { r = "bad"; }
    stats[r]++;
    if (r === "none" || r === "bad") console.log(r.toUpperCase(), item.id);
    if (++n % 25 === 0) { console.log(`${n}/${todo.length}`, JSON.stringify(stats)); writeFileSync(creditsFile, JSON.stringify(credits, null, 1)); }
  }
}));
writeFileSync(creditsFile, JSON.stringify(credits, null, 1));
console.log("finished", JSON.stringify(stats));
