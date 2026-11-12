import { pgTable, uuid, varchar, timestamp, integer, text } from "drizzle-orm/pg-core";
import { wars } from "./wars";
import { warParticipants } from "./warParticipants";

export const warAttacks = pgTable("war_attacks", {
  id: uuid("id").primaryKey().defaultRandom(),
  warId: uuid("war_id")
    .notNull()
    .references(() => wars.id, { onDelete: "cascade" }),
  participantId: uuid("participant_id")
    .notNull()
    .references(() => warParticipants.id, { onDelete: "cascade" }),
  defenderPosition: varchar("defender_position", { length: 10 }).notNull(),
  attackNumber: integer("attack_number").notNull(),
  stars: integer("stars").notNull().default(0),
  destruction: integer("destruction").notNull().default(0),
  attackerTh: integer("attacker_th"),
  defenderTh: integer("defender_th"),
  attackedAt: timestamp("attacked_at", { withTimezone: true }).notNull().defaultNow(),
  notes: text("attack_notes"),
  replayUrl: varchar("replay_url", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WarAttack = typeof warAttacks.$inferSelect;
export type NewWarAttack = typeof warAttacks.$inferInsert;