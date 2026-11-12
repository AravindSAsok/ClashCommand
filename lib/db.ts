import { NeonDatabase, neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

declare global {
  // eslint-disable-next-line no-var
  var _db: ReturnType<typeof drizzle> | undefined;
}

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable is not set. See .env.example",
    );
  }

  if (process.env.NODE_ENV === "development" && globalThis._db) {
    return globalThis._db;
  }

  const client = neon(process.env.DATABASE_URL);
  const db = drizzle(client, { schema });

  if (process.env.NODE_ENV === "development") {
    globalThis._db = db;
  }

  return db;
}

export const db = getDb();