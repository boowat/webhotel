import type { Prisma } from "@prisma/client";

import type { Hotel, RoomType } from "./types";

const hotelInclude = {
  rooms: {
    orderBy: {
      sortOrder: "asc",
    },
  },
  reviews: {
    orderBy: {
      sortOrder: "asc",
    },
  },
} satisfies Prisma.HotelInclude;

type HotelRecord = Prisma.HotelGetPayload<{ include: typeof hotelInclude }>;
type RoomRecord = HotelRecord["rooms"][number];

type DecimalLike =
  | number
  | string
  | {
      toNumber: () => number;
    };

function toNumber(value: DecimalLike): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

function isGalleryImage(value: unknown): value is { src: string; seed: string } {
  if (!value || typeof value !== "object") return false;

  const maybeImage = value as Record<string, unknown>;
  return (
    typeof maybeImage.src === "string" && typeof maybeImage.seed === "string"
  );
}

function toGallery(value: unknown): { src: string; seed: string }[] {
  return Array.isArray(value) ? value.filter(isGalleryImage) : [];
}

function mapRoomRecord(room: RoomRecord): RoomType {
  return {
    id: room.id,
    name: room.name,
    description: room.description,
    pricePerNight: toNumber(room.pricePerNight),
    maxGuests: room.maxGuests,
    beds: room.beds,
    size: room.size,
    sizeArea: room.sizeArea ?? undefined,
    image: room.image,
    imageSeed: room.imageSeed,
    totalUnits: room.totalUnits,
  };
}

export function mapHotelRecord(hotel: HotelRecord): Hotel {
  return {
    id: hotel.id,
    name: hotel.name,
    tagline: hotel.tagline,
    city: hotel.city,
    country: hotel.country,
    address: hotel.address,
    rating: toNumber(hotel.rating),
    reviewCount: hotel.reviewCount,
    pricePerNight: toNumber(hotel.pricePerNight),
    currency: hotel.currency,
    heroImage: hotel.heroImage,
    heroSeed: hotel.heroSeed,
    gallery: toGallery(hotel.gallery),
    description: hotel.description,
    highlights: hotel.highlights,
    amenities: hotel.amenities,
    rooms: hotel.rooms.map(mapRoomRecord),
    reviews: hotel.reviews.map((review) => ({
      author: review.author,
      location: review.location,
      rating: review.rating,
      date: review.date,
      text: review.text,
    })),
  };
}

async function getPrisma() {
  const { prisma } = await import("./db/prisma");
  return prisma;
}

export async function getHotels(): Promise<Hotel[]> {
  const prisma = await getPrisma();
  const hotels = await prisma.hotel.findMany({
    include: hotelInclude,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return hotels.map(mapHotelRecord);
}

export async function getHotel(id: string): Promise<Hotel | undefined> {
  const prisma = await getPrisma();
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: hotelInclude,
  });

  return hotel ? mapHotelRecord(hotel) : undefined;
}

export async function getRoom(hotelId: string, roomId: string) {
  const hotel = await getHotel(hotelId);
  if (!hotel) return undefined;

  const room = hotel.rooms.find((item) => item.id === roomId);
  if (!room) return undefined;

  return { hotel, room };
}

export async function findRoomById(roomId: string) {
  const prisma = await getPrisma();
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      hotel: {
        include: hotelInclude,
      },
    },
  });

  if (!room) return undefined;

  const hotel = mapHotelRecord(room.hotel);
  const mappedRoom = hotel.rooms.find((item) => item.id === room.id);

  return mappedRoom ? { hotel, room: mappedRoom } : undefined;
}
