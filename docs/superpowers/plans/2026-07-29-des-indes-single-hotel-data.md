# Des Indes Single-Hotel Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace OTA fixtures and hotel-listing search UI with one Des Indes hotel and three bookable room types.

**Architecture:** Preserve current `Hotel` and `RoomType` contracts, routes, and booking APIs. `hotels` becomes one fixture; search cards derive from its rooms and omit hotel-listing metadata.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Node test runner via `tsx`.

## Global Constraints

- One hotel: `id: "des-indes"`, name `Des Indes`, currency `IDR`.
- Exactly three room IDs: `deluxe`, `premium`, `presidential`.
- Keep `/hotels/[id]`, `/book/[id]`, booking API, and room IDs compatible.
- Search cards retain dates, guests, price, room details, filters, and reserve action. No hotel name, location, rating, or amenity controls/cards.
- Replace user-facing `Lumi Stays` branding with `Des Indes`.

---

## File Structure

- `src/lib/hotels.ts`: one Des Indes fixture and lookup helpers.
- `src/lib/hotels.test.ts`: fixture contract.
- `src/app/hotels/search/page.tsx`: room-type-only filters and cards.
- `src/app/book/[id]/page.tsx`, `src/app/hotels/[id]/page.tsx`, `src/components/Footer.tsx`, `src/components/OptionalLoginPopup.tsx`, `src/lib/email.ts`: branding.
- `package.json`: fixture test script.

### Task 1: Define one hotel and its three rooms

**Files:**
- Create: `src/lib/hotels.test.ts`
- Modify: `package.json`
- Modify: `src/lib/hotels.ts`

**Interfaces:**
- Consumes: `hotels`, `getHotel`, `getRoom`, `findRoomById`.
- Produces: one `Hotel` fixture plus stable lookup behavior for `des-indes`, `deluxe`, `premium`, and `presidential`.

- [x] **Step 1: Write failing fixture test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { findRoomById, getHotel, hotels } from "./hotels";

test("Des Indes exposes only three bookable room types", () => {
  assert.equal(hotels.length, 1);
  assert.equal(hotels[0].id, "des-indes");
  assert.equal(hotels[0].name, "Des Indes");
  assert.equal(hotels[0].currency, "IDR");
  assert.deepEqual(hotels[0].rooms.map(({ id }) => id), ["deluxe", "premium", "presidential"]);
  assert.equal(getHotel("des-indes"), hotels[0]);
  assert.equal(findRoomById("premium")?.room.name, "Premium");
});
```

- [x] **Step 2: Verify test fails**

Run: `npx tsx --test src/lib/hotels.test.ts`

Expected: failure because current fixture has five hotels and no `des-indes` ID.

- [x] **Step 3: Replace fixture**

Rewrite `src/lib/hotels.ts` with one Des Indes object. Retain image helper and unchanged lookup signatures. Set `currency: "IDR"`. Add rooms in this order:

```ts
[{ id: "deluxe", name: "Deluxe", pricePerNight: 1250000, maxGuests: 2 },
 { id: "premium", name: "Premium", pricePerNight: 1850000, maxGuests: 3 },
 { id: "presidential", name: "Presidential", pricePerNight: 3500000, maxGuests: 4 }]
```

Give every required `Hotel` and `RoomType` field coherent Indonesian dummy content. `findRoomById` returns its match from sole hotel.

- [x] **Step 4: Add test script and verify pass**

Add `"test": "tsx --test src/**/*.test.ts"` under `scripts` in `package.json`.

Run: `npm test`

Expected: one passing fixture-contract test.

- [x] **Step 5: Commit**

```bash
git add package.json src/lib/hotels.ts src/lib/hotels.test.ts
git commit -m "feat: use Des Indes room fixtures"
```

### Task 2: Make search results room-type-only

**Files:**
- Modify: `src/app/hotels/search/page.tsx`

**Interfaces:**
- Consumes: `hotels[0].rooms` and `priceBreakdown`.
- Produces: three room-type cards without hotel-listing metadata.

- [x] **Step 1: Remove hotel-level filters**

Delete `StarRating` import, `amenityOptions`, `selectedAmenities`, amenity query parsing and predicate, amenity checkboxes, and amenity pills. `activeFilterCount` counts price and bed-type filters only.

- [x] **Step 2: Render only room data**

Map `hotels[0].rooms` to `{ hotel: hotels[0], room }` for existing booking links. Delete hotel-name link, location, rating, and amenity markup. Card heading starts with `{room.name}`; retain room description, capacity, beds, size, price, total, and reserve link.

- [x] **Step 3: Verify**

Run: `npm run build`

Expected: success without stale `StarRating` or amenity references.

- [x] **Step 4: Commit**

```bash
git add src/app/hotels/search/page.tsx
git commit -m "feat: show Des Indes room types in search"
```

### Task 3: Replace visible OTA branding

**Files:**
- Modify: `src/app/book/[id]/page.tsx`
- Modify: `src/app/hotels/[id]/page.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/OptionalLoginPopup.tsx`
- Modify: `src/lib/email.ts`

**Interfaces:**
- Consumes: existing layout, metadata, and email functions.
- Produces: Des Indes branding without booking or mail behavior changes.

- [x] **Step 1: Replace brand copy**

Replace all user-visible `Lumi Stays` strings with `Des Indes`. Footer copy becomes: `A timeless stay, reserved in a few taps.` Keep current footer links and structure.

- [x] **Step 2: Verify no stale brand**

Run: `rg -n -i "Lumi Stays" src`

Expected: no output.

- [x] **Step 3: Commit**

```bash
git add src/app/book/[id]/page.tsx src/app/hotels/[id]/page.tsx src/components/Footer.tsx src/components/OptionalLoginPopup.tsx src/lib/email.ts
git commit -m "chore: brand booking flow as Des Indes"
```

### Task 4: Verify full change

**Files:** None.

Verified 2026-07-31 on `feat/des-indes-single-hotel` @ `e9e691d`: `npm test` passes, `npm run build` exits 0 (`/hotels/des-indes` prerendered), `rg -i "lumi stays" src` empty. `npm run lint` exits 1 on 24 pre-existing errors in untouched files (bookings API, `BookingFlow`, `BookingWidget`, `midtrans`, `useCallyValue`); eslint over only the files this change touched exits 0.

- [x] **Step 1: Run checks**

Run: `npm test && npm run lint && npm run build`

Expected: all exit 0.

- [x] **Step 2: Inspect scope**

Run: `git diff --check HEAD~3..HEAD && git status --short`

Expected: no whitespace errors; unrelated pre-existing files remain unstaged and untouched.
