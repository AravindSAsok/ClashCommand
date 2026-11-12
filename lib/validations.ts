import { z } from "zod";

export const clanSchema = z.object({
  name: z.string().min(1, "Clan name is required").max(255),
  tag: z.string().min(1, "Clan tag is required").max(20),
  description: z.string().max(1000).optional(),
  clanLevel: z.coerce.number().int().min(1).max(20).default(1),
  warLeague: z.enum(["unranked", "bronze", "silver", "gold", "crystal", "master", "champion", "titan", "legend"]).default("unranked"),
  location: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

export const playerSchema = z.object({
  playerTag: z.string().min(1, "Player tag is required").max(20),
  name: z.string().min(1, "Player name is required").max(255),
  townHallLevel: z.coerce.number().int().min(1).max(17).default(1),
  role: z.enum(["leader", "co_leader", "elder", "member"]).default("member"),
  profileImageUrl: z.string().url().optional().or(z.literal("")).optional(),
  notes: z.string().optional(),
});

export const clanMembershipSchema = z.object({
  playerId: z.string().uuid("Invalid player ID"),
  clanId: z.string().uuid("Invalid clan ID"),
  joinedAt: z.coerce.date(),
  leftAt: z.coerce.date().optional().nullable(),
  role: z.enum(["leader", "co_leader", "elder", "member"]).default("member"),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
  notes: z.string().optional(),
});

export const warSchema = z.object({
  clanId: z.string().uuid("Invalid clan ID"),
  cwlSeasonId: z.string().uuid().optional().nullable(),
  opponentName: z.string().min(1, "Opponent name is required").max(255),
  opponentTag: z.string().max(20).optional().nullable(),
  warType: z.enum(["normal", "cwl"]).default("normal"),
  warSize: z.coerce.number().int().min(5).max(50).default(50),
  maxAttacksPerPlayer: z.coerce.number().int().min(1).max(4).default(2),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().optional().nullable(),
  status: z.enum(["preparation", "active", "ended"]).default("preparation"),
  notes: z.string().optional(),
});

export const warAttackSchema = z.object({
  warId: z.string().uuid("Invalid war ID"),
  participantId: z.string().uuid("Invalid participant ID"),
  defenderPosition: z.string().min(1).max(10),
  attackNumber: z.coerce.number().int().min(1),
  stars: z.coerce.number().int().min(0).max(3),
  destruction: z.coerce.number().int().min(0).max(100),
  attackerTh: z.coerce.number().int().min(1).max(17).optional().nullable(),
  defenderTh: z.coerce.number().int().min(1).max(17).optional().nullable(),
  attackedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  replayUrl: z.string().url().optional().or(z.literal("")).optional(),
});

export type ClanInput = z.infer<typeof clanSchema>;
export type PlayerInput = z.infer<typeof playerSchema>;
export type ClanMembershipInput = z.infer<typeof clanMembershipSchema>;
export type WarInput = z.infer<typeof warSchema>;
export type WarAttackInput = z.infer<typeof warAttackSchema>;