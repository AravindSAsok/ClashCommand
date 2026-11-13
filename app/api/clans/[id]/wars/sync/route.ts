import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clans, players, wars, warParticipants, warAttacks } from "@/db/schema";
import { clashApi, normalizeClanTag } from "@/lib/clash-api";

type RouteContext = { params: Promise<{ id: string }> };

function parseCocDate(value?: string) {
  if (!value) return new Date();
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.\d+)?Z$/);
  if (!match) return new Date(value);
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]), Number(match[6])));
}

export async function POST(_req: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  try {
    const { id } = await params;
    const [clan] = await db.select().from(clans).where(eq(clans.id, id)).limit(1);
    if (!clan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });

    const tag = encodeURIComponent(`#${normalizeClanTag(clan.tag)}`);
    const currentWar = await clashApi<any>(`/clans/${tag}/currentwar`);
    if (!currentWar?.state || currentWar.state === "notInWar") {
      return NextResponse.json({ saved: false, message: "There is no active or recently ended war to sync." });
    }

    const startAt = parseCocDate(currentWar.startTime || currentWar.preparationStartTime);
    const opponent = currentWar.opponent || {};
    const opponentTag = normalizeClanTag(opponent.tag || "");
    const [existingWar] = await db.select().from(wars).where(and(
      eq(wars.clanId, clan.id),
      eq(wars.opponentTag, opponentTag || null),
      eq(wars.startAt, startAt),
    )).limit(1);

    const ours = currentWar.clan || {};
    const theirs = currentWar.opponent || {};
    const status: "preparation" | "active" | "ended" = currentWar.state === "preparation" ? "preparation" : currentWar.state === "warEnded" ? "ended" : "active";
    const result: "win" | "loss" | "draw" | null = status !== "ended" ? null : (Number(ours.stars || 0) > Number(theirs.stars || 0) ? "win" : Number(ours.stars || 0) < Number(theirs.stars || 0) ? "loss" : Number(ours.destructionPercentage || 0) > Number(theirs.destructionPercentage || 0) ? "win" : Number(ours.destructionPercentage || 0) < Number(theirs.destructionPercentage || 0) ? "loss" : "draw");

    const warValues = {
      opponentName: opponent.name || "Unknown clan",
      opponentTag: opponentTag || null,
      warSize: Number(currentWar.teamSize || 0) || 50,
      startAt,
      endAt: currentWar.endTime ? parseCocDate(currentWar.endTime) : null,
      status,
      ourStars: Number(ours.stars || 0),
      opponentStars: Number(theirs.stars || 0),
      ourDestruction: String(Number(ours.destructionPercentage || 0).toFixed(2)),
      opponentDestruction: String(Number(theirs.destructionPercentage || 0).toFixed(2)),
      result,
      updatedAt: new Date(),
    };

    let savedWarId = existingWar?.id;
    if (existingWar) {
      await db.update(wars).set(warValues).where(eq(wars.id, existingWar.id));
    } else {
      const [created] = await db.insert(wars).values({
        clanId: clan.id,
        warType: "normal",
        maxAttacksPerPlayer: 2,
        ...warValues,
      }).returning({ id: wars.id });
      savedWarId = created.id;
    }

    const opponentPositions = new Map<string, number>();
    for (const member of theirs.members || []) opponentPositions.set(normalizeClanTag(member.tag), Number(member.mapPosition || 0));

    let savedAttackCount = 0;
    for (const member of ours.members || []) {
      const playerTag = normalizeClanTag(member.tag);
      const [player] = await db.select().from(players).where(eq(players.playerTag, playerTag)).limit(1);
      if (!player) continue;

      const [existingParticipant] = await db.select().from(warParticipants).where(and(
        eq(warParticipants.warId, savedWarId!),
        eq(warParticipants.playerId, player.id),
      )).limit(1);
      const attacks = member.attacks || [];
      const participantValues = {
        attacksUsed: attacks.length,
        starsEarned: attacks.reduce((sum: number, attack: any) => sum + Number(attack.stars || 0), 0),
        destructionTotal: String(attacks.reduce((sum: number, attack: any) => sum + Number(attack.destructionPercentage || 0), 0).toFixed(2)),
        threeStarCount: attacks.filter((attack: any) => Number(attack.stars) === 3).length,
        updatedAt: new Date(),
      };

      let participantId = existingParticipant?.id;
      if (existingParticipant) {
        await db.update(warParticipants).set(participantValues).where(eq(warParticipants.id, existingParticipant.id));
      } else {
        const [created] = await db.insert(warParticipants).values({
          warId: savedWarId!,
          playerId: player.id,
          ...participantValues,
        }).returning({ id: warParticipants.id });
        participantId = created.id;
      }

      for (const attack of attacks) {
        const attackNumber = Number(attack.order || 1);
        const [existingAttack] = await db.select().from(warAttacks).where(and(
          eq(warAttacks.participantId, participantId!),
          eq(warAttacks.attackNumber, attackNumber),
        )).limit(1);
        const attackValues = {
          defenderPosition: String(opponentPositions.get(normalizeClanTag(attack.defenderTag || "")) || attack.defenderTag || "0"),
          attackNumber,
          stars: Number(attack.stars || 0),
          destruction: Math.round(Number(attack.destructionPercentage || 0)),
          attackerTh: Number(member.townhallLevel || 0) || null,
          defenderTh: null,
          updatedAt: new Date(),
        };
        if (existingAttack) {
          await db.update(warAttacks).set(attackValues).where(eq(warAttacks.id, existingAttack.id));
        } else {
          await db.insert(warAttacks).values({ warId: savedWarId!, participantId: participantId!, ...attackValues });
        }
        savedAttackCount++;
      }
    }

    return NextResponse.json({ saved: true, warId: savedWarId, savedAttackCount, message: "Current war snapshot saved." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to sync current war" }, { status: 400 });
  }
}