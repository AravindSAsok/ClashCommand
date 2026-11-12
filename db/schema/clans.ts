import { pgTable, uuid, varchar, timestamp, text, integer, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const clanWarLeagueEnum = pgEnum("clan_war_league", [
  "unranked",
  "bronze",
  "silver",
  "gold",
  "crystal",
  "master",
  "champion",
  "titan",
  "legend",
]);

export const clans = pgTable("clans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  tag: varchar("tag", { length: 20 }).notNull().unique(),
  description: text("description"),
  clanLevel: integer("clan_level").notNull().default(1),
  warLeague: clanWarLeagueEnum("war_league").notNull().default("unranked"),
  location: varchar("location", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Clan = typeof clans.$inferSelect;
export type NewClan = typeof clans.$inferInsert;