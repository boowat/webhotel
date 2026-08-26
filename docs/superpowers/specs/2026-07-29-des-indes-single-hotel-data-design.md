# Des Indes single-hotel dummy data

## Goal

Make application represent one hotel, Des Indes, rather than an OTA listing multiple hotels. Search returns three bookable room types only.

## Data

- Replace `hotels` fixture with one hotel: `id: "des-indes"`, name `Des Indes`, currency `IDR`.
- Replace its rooms with `deluxe`, `premium`, and `presidential` fixtures.
- Give each room coherent Indonesian dummy copy, prices in rupiah, capacity, beds, size, and image metadata.
- Preserve current `Hotel` and `RoomType` interfaces plus room IDs used by booking APIs.

## Search results

- Build results from Des Indes' three room types only.
- Present each result as a room type, not a hotel listing.
- Remove repeated hotel name, city, rating, and hotel-amenity presentation from result cards.
- Keep date, guest, price, and bed filters plus booking action.

## Compatibility

- Keep `/hotels/[id]`, `/book/[id]`, booking API, and existing search parameters.
- Existing flows resolve the single `des-indes` hotel and one of its three room IDs.
- Replace visible `Lumi Stays` branding with `Des Indes` where it describes the hotel.

## Verification

- Add or update focused coverage for single-hotel fixture and three-room search result assumptions where test setup supports it.
- Run lint and production build.
