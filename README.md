# Lumi Stays — Hotel Bookings Prototype

A clickable prototype of a hotel booking experience, built to show a client.
Next.js (App Router) + Tailwind CSS, with **mock data only** — no backend, no
database, no real payments.

## What's in the demo

- **Landing page** — hero, featured stay, and a grid of six curated hotels.
- **Hotel detail page** (`/hotels/[id]`) — gallery, description, highlights,
  amenities, room types, guest reviews, and a sticky booking widget that prices
  a stay live (nights × rate + service fee + taxes).
- **Booking flow** (`/book/[id]`) — edit room/dates/guests, enter guest and
  (mock) payment details, and get an instant confirmation with a booking
  reference. No card is ever charged.

All hotels and prices live in [`lib/hotels.ts`](lib/hotels.ts).

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

To build the production bundle:

```bash
npm run build
npm run start
```

### Troubleshooting: SWC binary on restricted networks

If `npm run build`/`dev` fails with `SELF_SIGNED_CERT_IN_CHAIN` while downloading
`@next/swc-win32-x64-msvc`, your network blocks Next's direct binary download.
Fetch it through npm instead (npm trusts the corporate cert):

```bash
npm pack @next/swc-win32-x64-msvc@14.2.33
mkdir -p node_modules/@next/swc-win32-x64-msvc
tar -xzf next-swc-win32-x64-msvc-14.2.33.tgz -C node_modules/@next/swc-win32-x64-msvc --strip-components=1
```

## Project structure

```
app/
  page.tsx               landing page
  hotels/[id]/page.tsx   hotel detail
  book/[id]/page.tsx     booking flow
components/              UI building blocks
lib/
  hotels.ts              mock hotel data
  types.ts               data model
  pricing.ts             nights + price math
```

## Notes for the next iteration

This is a prototype. Before it becomes real, it needs: a backend/data source,
real availability and pricing, authentication, and a payment provider. The data
model in `lib/types.ts` is shaped to map onto those later.
