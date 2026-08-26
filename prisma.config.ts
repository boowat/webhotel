import { config } from "dotenv";
// Prisma CLI only auto-loads `.env`, but this project keeps env vars in
// `.env.local` (Next.js convention). Load that first, then fall back to `.env`.
config({ path: ".env.local" });
config();

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npm run db:seed",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
