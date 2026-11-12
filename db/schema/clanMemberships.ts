import { pgTable, uuid, varchar, timestamp, integer, text } from "drizzle-orm/pg-core";
import { players } from "./players";
import { clans } from "./clans";
import { playerRoleEnum } from "./players";

export const membershipStatusEnum = pgEnum("membership_status", ["active", "inactive", "archived"]);

export const clanMemberships = pgTable("clan_memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "restrict" }),
  clanId: uuid("clan_id")
    .notNull()
    .references(() => clans.id, { onDelete: "restrict" }),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  leftAt: timestamp("left_at", { withTimezone: true }),
  role: playerRoleEnum("role").notNull().default("member"),
  status: membershipStatusEnum("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ClanMembership = typeof clanMemberships.$inferSelect;
export type NewClanMembership = typeof clanMemberships.$inferInsert;