import { relations } from "drizzle-orm";
import {
  users, clans, players, clanMemberships, cwlSeasons, wars,
  warParticipants, warAttacks, warDefenses, activityLogs,
} from "./index";

export const usersRelations = relations(users, ({ many }) => ({
  clans: many(clans),
  activityLogs: many(activityLogs),
}));
export const clansRelations = relations(clans, ({ one, many }) => ({
  creator: one(users, { fields: [clans.createdBy], references: [users.id] }),
  memberships: many(clanMemberships),
  wars: many(wars),
  cwlSeasons: many(cwlSeasons),
}));
export const playersRelations = relations(players, ({ many }) => ({
  memberships: many(clanMemberships),
  warParticipants: many(warParticipants),
  warDefenses: many(warDefenses),
}));
export const clanMembershipsRelations = relations(clanMemberships, ({ one }) => ({
  player: one(players, { fields: [clanMemberships.playerId], references: [players.id] }),
  clan: one(clans, { fields: [clanMemberships.clanId], references: [clans.id] }),
}));
export const cwlSeasonsRelations = relations(cwlSeasons, ({ one, many }) => ({
  clan: one(clans, { fields: [cwlSeasons.clanId], references: [clans.id] }),
  wars: many(wars),
}));
export const warsRelations = relations(wars, ({ one, many }) => ({
  clan: one(clans, { fields: [wars.clanId], references: [clans.id] }),
  cwlSeason: one(cwlSeasons, { fields: [wars.cwlSeasonId], references: [cwlSeasons.id] }),
  participants: many(warParticipants),
  attacks: many(warAttacks),
  defenses: many(warDefenses),
}));
export const warParticipantsRelations = relations(warParticipants, ({ one, many }) => ({
  war: one(wars, { fields: [warParticipants.warId], references: [wars.id] }),
  player: one(players, { fields: [warParticipants.playerId], references: [players.id] }),
  attacks: many(warAttacks),
}));
export const warAttacksRelations = relations(warAttacks, ({ one }) => ({
  war: one(wars, { fields: [warAttacks.warId], references: [wars.id] }),
  participant: one(warParticipants, { fields: [warAttacks.participantId], references: [warParticipants.id] }),
}));
export const warDefensesRelations = relations(warDefenses, ({ one }) => ({
  war: one(wars, { fields: [warDefenses.warId], references: [wars.id] }),
  defender: one(players, { fields: [warDefenses.defenderPlayerId], references: [players.id] }),
  attackingParticipant: one(warParticipants, { fields: [warDefenses.attackingParticipantId], references: [warParticipants.id] }),
}));
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}));
