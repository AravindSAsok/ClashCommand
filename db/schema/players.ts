import { pgTable, uuid, varchar, timestamp, integer, text } from "drizzle-orm/pg-core";

export const playerRoleEnum = pgEnum("player_role", ["leader", "co_leader", "elder", "member"]);

export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerTag: varchar("player_tag", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  townHallLevel: integer("town_hall_level").notNull().default(1),
  role: playerRoleEnum("role").notNull().default("member"),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;