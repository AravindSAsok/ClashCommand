import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq, desc } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clans, wars, warParticipants, warAttacks, players } from "@/db/schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const [clan] = await db.select().from(clans).where(eq(clans.id, id)).limit(1);
    if (!clan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });

    const savedWars = await db.select().from(wars)
      .where(eq(wars.clanId, id))
      .orderBy(desc(wars.startAt));

    const warLog = savedWars.map((war) => ({
      endTime: war.endAt?.toISOString() || war.startAt.toISOString(),
      teamSize: war.warSize,
      clan: {
        name: clan.name,
        stars: war.ourStars,
        destructionPercentage: Number(war.ourDestruction),
        result: war.result,
      },
      opponent: {
        name: war.opponentName,
        tag: war.opponentTag,
        stars: war.opponentStars,
        destructionPercentage: Number(war.opponentDestruction),
      },
    }));

    const liveWar = savedWars.find((war) => war.status !== "ended");
    let currentWar = null;
    if (liveWar) {
      const participants = await db.select({
        participantId: warParticipants.id,
        playerTag: players.playerTag,
        name: players.name,
        townHallLevel: players.townHallLevel,
      }).from(warParticipants)
        .innerJoin(players, eq(warParticipants.playerId, players.id))
        .where(eq(warParticipants.warId, liveWar.id));

      const members = await Promise.all(participants.map(async (participant) => {
        const attacks = await db.select().from(warAttacks)
          .where(eq(warAttacks.participantId, participant.participantId))
          .orderBy(warAttacks.attackNumber);
        return {
          tag: participant.playerTag,
          name: participant.name,
          townhallLevel: participant.townHallLevel,
          attacks: attacks.map((attack) => ({
            order: attack.attackNumber,
            stars: attack.stars,
            destructionPercentage: attack.destruction,
            defenderPosition: attack.defenderPosition,
          })),
        };
      }));

      currentWar = {
        state: liveWar.status === "preparation" ? "preparation" : "inWar",
        clan: { name: clan.name, stars: liveWar.ourStars, members },
        opponent: {
          name: liveWar.opponentName,
          tag: liveWar.opponentTag,
          stars: liveWar.opponentStars,
        },
      };
    }

    return NextResponse.json({ warLog, currentWar, warLogError: null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load saved wars" }, { status: 500 });
  }
}