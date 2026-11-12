import { pgTable, uuid, varchar, timestamp, text, pgEnum } from "drizzle-orm/pg-core";
import { clans } from "./clans";

export const cwlSeasonStatusEnum = pgEnum("cwl_season_status", ["upcoming", "active", "completed"]);

export const cwlSeasons = pgTable("cwl_seasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  clanId: uuid("clan_id").notNull().references(() => clans.id, { onDelete: "restrict" }),
  seasonTag: varchar("season_tag", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }),
  status: cwlSeasonStatusEnum("status").notNull().default("upcoming"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CwlSeason = typeof cwlSeasons.$inferSelect;
export type NewCwlSeason = typeof cwlSeasons.$inferInsert;
