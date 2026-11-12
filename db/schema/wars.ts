import { pgTable, uuid, varchar, timestamp, integer, text, numeric } from "drizzle-orm/pg-core";
import { clans } from "./clans";
import { cwlSeasons } from "./cwlSeasons";

export const warTypeEnum = pgEnum("war_type", ["normal", "cwl"]);
export const warStatusEnum = pgEnum("war_status", ["preparation", "active", "ended"]);
export const warResultEnum = pgEnum("war_result", ["win", "loss", "draw"]);

export const wars = pgTable("wars", {
  id: uuid("id").primaryKey().defaultRandom(),
  clanId: uuid("clan_id")
    .notNull()
    .references(() => clans.id, { onDelete: "restrict" }),
  cwlSeasonId: uuid("cwl_season_id").references(() => cwlSeasons.id, {
    onDelete: "set null",
  }),
  opponentName: varchar("opponent_name", { length: 255 }).notNull(),
  opponentTag: varchar("opponent_tag", { length: 20 }),
  warType: warTypeEnum("war_type").notNull().default("normal"),
  warSize: integer("war_size").notNull().default(50),
  maxAttacksPerPlayer: integer("max_attacks_per_player").notNull().default(2),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }),
  status: warStatusEnum("status").notNull().default("preparation"),
  ourStars: integer("our_stars").notNull().default(0),
  opponentStars: integer("opponent_stars").notNull().default(0),
  ourDestruction: numeric("our_destruction", { precision: 5, scale: 2 }).notNull().default("0.00"),
  opponentDestruction: numeric("opponent_destruction", { precision: 5, scale: 2 }).notNull().default("0.00"),
  result: warResultEnum("result"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type War = typeof wars.$inferSelect;
export type NewWar = typeof wars.$inferInsert;