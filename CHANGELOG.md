# Changelog

All notable changes to this project are documented here.

## [0.1.0.0] - 2026-06-14

Initial prototype for client demo.

### Added
- Landing page with hero, featured stay, and a curated grid of six hotels.
- Hotel detail page (`/hotels/[id]`): photo gallery, description, highlights,
  amenities, room types, guest reviews, and a live-pricing sticky booking widget.
- Booking flow (`/book/[id]`): editable room/dates/guests, guest and mock
  payment details, validation, and an instant confirmation screen with a
  generated booking reference.
- Mock hotel dataset (`lib/hotels.ts`) covering Bali, Tokyo, Zermatt, Lisbon,
  Marrakech, and Brooklyn.
- Reusable UI: navbar, footer, hotel card, gallery, star rating, amenity list,
  room card, and a `SafeImage` component with a guaranteed image fallback.
- Tailwind design system with a custom brand palette.
