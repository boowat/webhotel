import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/* ------------------------------------------------------------------ */
/*  Singleton Prisma Client for Next.js                                */
/*                                                                     */
/*  In development, Next.js hot-reloads and re-imports modules which   */
/*  would create a new PrismaClient (and DB connection) every time.    */
/*  We store the instance on `globalThis` to prevent connection leaks. */
/* ------------------------------------------------------------------ */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
