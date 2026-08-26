import { config } from "dotenv";

// Match prisma.config.ts: env vars live in `.env.local` (Next.js convention),
// with `.env` as fallback. Plain `dotenv/config` would only read `.env`.
config({ path: ".env.local" });
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { seedHotel } from "./seed-data";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const { rooms, reviews, ...hotel } = seedHotel;

  await prisma.hotel.upsert({
    where: { id: hotel.id },
    update: {
      ...hotel,
      gallery: hotel.gallery,
    },
    create: {
      ...hotel,
      gallery: hotel.gallery,
    },
  });

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { id: room.id },
      update: {
        ...room,
        hotelId: hotel.id,
      },
      create: {
        ...room,
        hotelId: hotel.id,
      },
    });
  }

  for (const review of reviews) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: {
        ...review,
        hotelId: hotel.id,
      },
      create: {
        ...review,
        hotelId: hotel.id,
      },
    });
  }

  console.log(
    `Seeded ${hotel.name} with ${rooms.length} room types and ${rooms.reduce(
      (total, room) => total + room.totalUnits,
      0,
    )} room units.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
