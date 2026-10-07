# EatingHUB

Restaurant POS for a pure-veg kitchen: table-wise ordering, reservations, GST billing and a sales dashboard. All data lives in the browser (localStorage), so no backend is needed.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck
```

Set `NEXT_PUBLIC_SITE_URL` to your domain in production. The sitemap, canonical URLs and structured data use it.

## Pages

| Route | What it is | Indexed |
|---|---|---|
| `/` | Floor: tables, reservations, seat / free / add / remove tables | no |
| `/table/[id]` | Take an order for a table | no |
| `/table/[id]/bill` | GST invoice, payment, settle | no |
| `/bills` | Bill history with today / month / quarter / year / last-year filters | no |
| `/dashboard` | Revenue, GST, monthly & quarterly charts, top dishes, payments | no |
| `/menu` | Public, statically rendered menu with schema.org data | yes |

## Project structure

```
src/
  app/            Routes only: thin pages, metadata, sitemap, robots, OG image
  config/         Site name, URL, nav links, private paths
  features/       One folder per feature; owns its components
    floor/        Floor view, table card + animated illustration, booking/seat/table forms
    pos/          Order screen, menu filters, dish card, cart, checkout
    bills/        Bill history, invoice, date-range filters
    dashboard/    KPIs, charts (charts/), year-over-year, recent bills
    menu/         Public menu + structured data
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
- **Logic stays out of components.** Billing, analytics and formatting live in `lib/` as pure functions.
- **State goes through `store/`.** Components use `useAppSelector` and selectors from `store/selectors.ts`. `useAppSelector` reads the server snapshot during hydration, so data saved in localStorage never causes a hydration mismatch.
- **Styling uses design tokens.** Colours are tokens in `app/globals.css` (light and dark), and components use semantic classes (`bg-surface`, `text-muted`, `btn-primary`, …).

## Sample data

On first run, 60 sample bills are generated, spread from January last year to yesterday, so the dashboard has data straight away. They are marked "sample" and can be removed from the Bills page.

## Menu & images

Edit `scripts/build-menu.mjs` and run `node scripts/build-menu.mjs`. Then run `node scripts/fetch-images.mjs` to download photos for any new dishes (from Wikimedia Commons; credits are in `src/data/image-credits.json`).
