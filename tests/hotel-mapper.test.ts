import test from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";

import { mapHotelRecord } from "../src/lib/hotels";

const decimal = (value: number) => new Prisma.Decimal(value);

test("mapHotelRecord converts Prisma hotel records into app hotel data", () => {
  const hotel = mapHotelRecord({
    id: "hotel-des-indes",
    name: "Hotel Des Indes Menteng Jakarta",
    tagline: "Exclusive and unique hotel in the city center",
    city: "Menteng, Jakarta",
    country: "Indonesia",
    address: "Jl. HOS Cokroaminoto No. 84",
    rating: decimal(4.8),
    reviewCount: 328,
    pricePerNight: decimal(750000),
    currency: "IDR",
    heroImage: "/banner.jpg",
    heroSeed: "des-indes-hero",
    gallery: [{ src: "/banner.jpg", seed: "hero" }],
    description: "A refined city hotel.",
    highlights: ["Central Menteng location"],
    amenities: ["Free Wi-Fi"],
    sortOrder: 1,
    createdAt: new Date("2026-07-20T00:00:00.000Z"),
    updatedAt: new Date("2026-07-20T00:00:00.000Z"),
    rooms: [
      {
        id: "standard",
        hotelId: "hotel-des-indes",
        name: "Standard Room",
        description: "Comfortable city room.",
        pricePerNight: decimal(750000),
        maxGuests: 2,
        beds: "1 queen bed",
        size: "28 sqm",
        sizeArea: null,
        image: "/standard.jpg",
        imageSeed: "standard-room",
        totalUnits: 10,
        sortOrder: 1,
        createdAt: new Date("2026-07-20T00:00:00.000Z"),
        updatedAt: new Date("2026-07-20T00:00:00.000Z"),
      },
    ],
    reviews: [
      {
        id: "review-1",
        hotelId: "hotel-des-indes",
        author: "Andini P.",
        location: "Bandung, Indonesia",
        rating: 5,
        date: "Jun 2026",
        text: "Quiet and central.",
        sortOrder: 1,
        createdAt: new Date("2026-07-20T00:00:00.000Z"),
        updatedAt: new Date("2026-07-20T00:00:00.000Z"),
      },
    ],
  });

  assert.equal(hotel.id, "hotel-des-indes");
  assert.equal(hotel.pricePerNight, 750000);
  assert.equal(hotel.rooms[0].id, "standard");
  assert.equal(hotel.rooms[0].totalUnits, 10);
  assert.deepEqual(hotel.gallery, [{ src: "/banner.jpg", seed: "hero" }]);
  assert.equal(hotel.reviews[0].rating, 5);
});
