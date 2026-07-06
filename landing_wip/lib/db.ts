import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Server-only. Lazily creates the Neon HTTP client + drizzle instance so
// importing this module never throws at build time when DATABASE_URL is
// absent (e.g. a preview build without the env var wired up yet).

type Db = ReturnType<typeof drizzle<typeof schema>>;

let db: Db | null = null;

export function getDb(): Db {
  if (db) return db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL no está definido. Agregalo en .env.local (Neon → Connection string)."
    );
  }

  db = drizzle(neon(url), { schema });
  return db;
}
