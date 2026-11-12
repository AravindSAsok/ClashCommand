import { pgTable, uuid, varchar, timestamp, integer, numeric, text } from "drizzle-orm/pg-core";
import { wars } from "./wars";
import { players } from "./players";

export const warParticipants = pgTable("war_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  warId: uuid("war_id").notNull().references(() => wars.id, { onDelete: "cascade" }),
  playerId: uuid("player_id").notNull().references(() => players.id, { onDelete: "restrict" }),
  attacksUsed: integer("attacks_used").notNull().default(0),
  starsEarned: integer("stars_earned").notNull().default(0),
  destructionTotal: numeric("destruction_total", { precision: 5, scale: 2 }).notNull().default("0.00"),
  threeStarCount: integer("three_star_count").notNull().default(0),
  notes: text("participant_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WarParticipant = typeof warParticipants.$inferSelect;
export type NewWarParticipant = typeof warParticipants.$inferInsert;
