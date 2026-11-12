import { pgTable, uuid, timestamp, integer, text } from "drizzle-orm/pg-core";
import { wars } from "./wars";
import { players } from "./players";
import { warParticipants } from "./warParticipants";

export const warDefenses = pgTable("war_defenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  warId: uuid("war_id")
    .notNull()
    .references(() => wars.id, { onDelete: "cascade" }),
  defenderPlayerId: uuid("defender_player_id")
    .notNull()
    .references(() => players.id, { onDelete: "restrict" }),
  attackingParticipantId: uuid("attacking_participant_id").references(
    () => warParticipants.id,
    { onDelete: "set null" },
  ),
  starsConceded: integer("stars_conceded").notNull().default(0),
  destructionConceded: integer("destruction_conceded").notNull().default(0),
  attackedAt: timestamp("attacked_at", { withTimezone: true }).notNull().defaultNow(),
  notes: text("defense_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WarDefense = typeof warDefenses.$inferSelect;
export type NewWarDefense = typeof warDefenses.$inferInsert;