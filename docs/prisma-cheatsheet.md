# Prisma Cheatsheet

Quick reference for working with Prisma in this project.

## The 3 things that must match

| Thing             | What it is                                           | Where it lives                     |
| ----------------- | ---------------------------------------------------- | ---------------------------------- |
| **Schema**        | What you _want_ the data to look like                | `prisma/schema.prisma` (text file) |
| **Database**      | The real tables                                      | Postgres in Docker                 |
| **Prisma client** | TypeScript code the app uses to talk to the database | `node_modules/.prisma/client`      |

Editing `schema.prisma` changes **none** of the other two. You run a command for each.

## The commands

| Command                                | Updates       | In one line                                              |
| -------------------------------------- | ------------- | -------------------------------------------------------- |
| `npx prisma migrate dev --name <name>` | Database      | Creates a migration file and applies it to your local DB |
| `npx prisma migrate deploy`            | Database      | Applies migration files that already exist (from git)    |
| `npx prisma generate`                  | Prisma client | Rebuilds TypeScript types from the schema                |
| `npm run db:seed`                      | Database rows | Fills tables with data from `prisma/seed-data.ts`        |
| `npx prisma migrate status`            | Nothing       | Shows which migrations are applied or pending            |
| `npx prisma studio`                    | Nothing       | Opens a browser UI to look at your data                  |

> Prisma 7: `migrate dev` does **not** run `generate` for you. Always run both.

## Recipes

### Start working (every day)

1. Open Docker Desktop, wait until it is running
2. `docker compose up -d`
3. `npm run dev`

### I changed `schema.prisma`

1. Edit `prisma/schema.prisma`
2. `npx prisma migrate dev --name what_you_changed`
3. `npx prisma generate`
4. If you also changed seed data: `npm run db:seed`
5. Restart `npm run dev` (Ctrl+C, then run again)
6. Commit the schema **and** the new folder in `prisma/migrations/`

### I pulled a teammate's schema change

1. `npx prisma migrate deploy`
2. `npx prisma generate`
3. `npm run db:seed` (safe to re-run, it uses upsert)
4. Restart `npm run dev`

### Fresh clone / new laptop

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in
3. Open Docker Desktop, then `docker compose up -d`
4. `npx prisma migrate deploy`
5. `npx prisma generate`
6. `npm run db:seed`
7. `npm run dev`

### I only changed seed data

1. Edit `prisma/seed-data.ts`
2. `npm run db:seed`

No migrate, no generate.

## Common errors

| You see                                                | Cause                                                                         | Fix                                                                                   |
| ------------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `P1001: Can't reach database server`                   | Docker or the DB container is not running                                     | Open Docker Desktop, `docker compose up -d`                                           |
| `P1000: Authentication failed`                         | `DATABASE_URL` points to the wrong Postgres (port clash with another project) | Check the port in `.env.local` matches `docker-compose.override.yml`                  |
| Wiggly underline on a new field (e.g. `room.gallery`)  | Prisma client is old                                                          | `npx prisma generate`, then VS Code: Ctrl+Shift+P > **TypeScript: Restart TS Server** |
| App says a field/model is missing, but types look fine | Dev server still has the old client loaded                                    | Restart `npm run dev`                                                                 |
| `column ... does not exist`                            | Migration not applied to your DB                                              | `npx prisma migrate deploy`                                                           |
| Page shows no data / empty list                        | Tables exist but are empty                                                    | `npm run db:seed`                                                                     |
| `DATABASE_URL environment variable is not set`         | Env file not loaded                                                           | Make sure `.env.local` exists in the project root                                     |

## Rules of thumb

- **Never edit** files inside `prisma/migrations/` after they are committed. Make a new migration instead.
- If `migrate dev` asks to **reset** the database, stop and check why first. Reset deletes all data.
- Schema change = migrate + generate. Always both.
- When in doubt: `npx prisma migrate status`.
