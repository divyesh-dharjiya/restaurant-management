# EatingHUB

A restaurant website and POS for a pure-veg kitchen. The public site (home and menu) is server-rendered for search engines. The staff POS, behind a PIN, handles table-wise ordering, kitchen tickets, reservations, GST billing and a sales dashboard. All data lives in the browser (localStorage), so no backend is needed.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck
npm test           # unit tests (Vitest): GST billing, dashboard periods, reservations, store, backups
```

Set `NEXT_PUBLIC_SITE_URL` to your domain in production. The sitemap, canonical URLs and structured data use it.

## Pages

| Route | What it is | Indexed |
|---|---|---|
| `/` | Public home: highlights, favourite dishes, opening hours, FAQ (Restaurant + FAQPage schema) | yes |
| `/menu` | Public, statically rendered menu with schema.org data | yes |
| `/pos` | Floor: tables, reservations, seat / free / add / remove tables | no |
| `/pos/table/[id]` | Take an order, add kitchen notes, send kitchen tickets (KOT) | no |
| `/pos/table/[id]/bill` | GST invoice, split calculator, payment, settle | no |
| `/pos/kitchen` | Kitchen display: new, cooking, ready; printable KOT slips | no |
| `/pos/menu` | Mark dishes sold out; the till then blocks them | no |
| `/pos/bills` | Bill history with date filters, void with reason, CSV, backup | no |
| `/pos/dashboard` | Revenue, GST, monthly & quarterly charts, top dishes, payments | no |

Old URLs (`/bills`, `/dashboard`, `/table/...`) redirect permanently to their `/pos` versions.

## Project structure

```
src/
  app/            Routes only: thin pages, metadata, sitemap, robots, OG image
    pos/          Staff app: PIN gate, Redux store, staff navbar, storage banner
    (public)/     Customer pages (/, /menu): no store, minimal JS
  config/         Site name, URL, nav links, private paths
  features/       One folder per feature; owns its components
    floor/        Floor view, table card + animated illustration, booking/seat/table forms
    pos/          Order screen, menu filters, dish card, cart, checkout
    bills/        Bill history, invoice, date-range filters
    dashboard/    KPIs, charts (charts/), year-over-year, recent bills
    menu/         Public menu + structured data
    home/         Public home page sections and FAQ content
    auth/         Staff PIN lock (hashing, idle lock, attempt limits)
    kitchen/      Kitchen display, ticket cards, printable KOT slip
    menu-manager/ Sold-out toggles for the till
  components/
    ui/           Reusable primitives (Modal, Stepper, StatCard, Segmented, …)
    layout/       Navbar, Logo
  hooks/          Generic React hooks (useNow, useElementWidth, useScrollPast)
  lib/            Pure logic: catalog, billing (GST), analytics, formatting, sample data
  store/          Redux Toolkit: slices/, selectors, typed hooks, persistence
  types/          Shared domain types
  data/           menu.json (menu, tables, tax config) and image credits
```

Conventions:

- **Routes stay thin.** A route file sets metadata and renders one feature view.
- **Public and staff are separate.** The public menu never loads the store or animation library, and images there use `getImageProps` (plain `<img>`, no hydration).
- **Navigation never feels frozen.** Table routes are pre-rendered and prefetched when a table is tapped, `loading.tsx` shows a skeleton instantly, and nav links show a pending spinner.
- **Logic stays out of components.** Billing, analytics and formatting live in `lib/` as pure functions.
- **State goes through `store/`.** Components use `useAppSelector` and selectors from `store/selectors.ts`. `useAppSelector` reads the server snapshot during hydration, so data saved in localStorage never causes a hydration mismatch.
- **Styling uses design tokens.** Colours are tokens in `app/globals.css` (light and dark), and components use semantic classes (`bg-surface`, `text-muted`, `btn-primary`, …).

## Reservations

A table can hold several bookings (lunch and dinner). It shows **Reserved** only from 2 hours before a booking until 30 minutes after; after that the booking is flagged **Late** so staff can mark a no-show. Walk-ins can always be seated, and seating them never removes a booking: use **Arrived** on the booking when that party comes in. Bookings on the same table must be at least 90 minutes apart.

## Data safety

Everything is stored in this browser's localStorage, which holds roughly 5 MB (about 6,000 bills). The Bills page has a **Data & backup** panel:

- **Export CSV**: the bills in the selected date range, with GST columns, for Excel or an accountant
- **Backup** / **Restore**: the whole app state as one JSON file
- **Archive old**: downloads, then removes, bills older than 2 years

A banner appears on every page if storage passes 80% or a save fails.

> Keep the project folder **outside OneDrive/Dropbox** (or exclude `node_modules` and `.next` from sync). Background syncing can corrupt files while `npm install` or the dev server is writing them.

## Sample data

On first run, 60 sample bills are generated, spread from January last year to yesterday, so the dashboard has data straight away. They are marked "sample" and can be removed from the Bills page.

## Menu & images

Edit `scripts/build-menu.mjs` and run `node scripts/build-menu.mjs`. Then run `node scripts/fetch-images.mjs` to download photos for any new dishes (from Wikimedia Commons; credits are in `src/data/image-credits.json`).

## Staff PIN lock

The first visit to `/pos` asks for a 4–6 digit staff PIN. Only a salted SHA-256 hash is stored. An unlock lasts for that browser tab and ends after 15 minutes without activity, or when staff press the lock button. Five wrong PINs in a row pause entry for 30 seconds. "Forgot PIN" can only reset the PIN by erasing all POS data on the device, so the lock can't be skipped to read bills.

> This is a demo-grade gate for a browser-only app. It keeps casual visitors out, but anyone with access to the device's storage can read the data. A real deployment needs server-side authentication.

## Kitchen tickets (KOT)

Each order remembers how much of each dish the kitchen has already been told about. **Send KOT** sends only what changed: new dishes and extra quantities, plus cancellations if something was reduced after sending. Tickets appear on `/pos/kitchen` and move from New to Cooking to Ready to Served; tickets older than 15 minutes are highlighted. Moving an order to another table moves its tickets, settling marks them served, and freeing a table without a bill removes them. Served tickets are kept for 12 hours.

## Bills: split and void

The bill screen splits the total equally in whole rupees (shares always add up to the total). A settled bill can be **voided** with a reason. It keeps its number and appears with a VOID stamp, but is left out of sales, GST and the dashboard, and the CSV export marks it.

## Quality

- `npm run typecheck` and `npm test` (1,339 unit tests: billing, GST, kitchen tickets, reservations, PIN logic, store, persistence, CSV).
- Lighthouse (mobile, production build): SEO, accessibility and best practices 100 on `/` and `/menu`; performance 85–87 on `/` and 77–83 on `/menu` (245 dishes on one page).
