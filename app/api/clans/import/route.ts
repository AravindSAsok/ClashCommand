import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq, and, isNull } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clans, players, clanMemberships } from "@/db/schema";
import { clashApi, normalizeClanTag, type CocClan, type CocMember } from "@/lib/clash-api";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const tag = normalizeClanTag(String(body.tag || ""));
    if (!/^[0289PYLQGRJCUV]{3,20}$/.test(tag)) {
      return NextResponse.json({ error: "Enter a valid clan tag, for example #2PP." }, { status: 400 });
    }

    const encodedTag = encodeURIComponent(`#${tag}`);
    const [clanData, memberData] = await Promise.all([
      clashApi<CocClan>(`/clans/${encodedTag}`),
      clashApi<{ items: CocMember[] }>(`/clans/${encodedTag}/members?limit=50`),
    ]);

    const [savedClan] = await db.insert(clans).values({
      name: clanData.name,
      tag,
      clanLevel: clanData.clanLevel || 1,
      warLeague: "unranked",
      location: clanData.location?.name || null,
      createdBy: (session.user as { id?: string }).id || null,
      isActive: true,
    }).onConflictDoUpdate({
      target: clans.tag,
      set: {
        name: clanData.name,
        clanLevel: clanData.clanLevel || 1,
        location: clanData.location?.name || null,
        isActive: true,
        updatedAt: new Date(),
      },
    }).returning();

    const members = memberData.items || [];
    for (const member of members) {
      const playerTag = normalizeClanTag(member.tag);
      const [savedPlayer] = await db.insert(players).values({
        playerTag,
        name: member.name,
        townHallLevel: member.townHallLevel || 1,
        role: member.role === "leader" ? "leader" : member.role === "coLeader" ? "co_leader" : member.role === "admin" ? "elder" : "member",
      }).onConflictDoUpdate({
        target: players.playerTag,
        set: {
          name: member.name,
          role: member.role === "leader" ? "leader" : member.role === "coLeader" ? "co_leader" : member.role === "admin" ? "elder" : "member",
          updatedAt: new Date(),
        },
      }).returning();

      const [activeMembership] = await db.select().from(clanMemberships).where(and(
        eq(clanMemberships.playerId, savedPlayer.id),
        eq(clanMemberships.clanId, savedClan.id),
        eq(clanMemberships.status, "active"),
        isNull(clanMemberships.leftAt),
      )).limit(1);

      if (activeMembership) {
        await db.update(clanMemberships).set({
          role: savedPlayer.role,
          updatedAt: new Date(),
        }).where(eq(clanMemberships.id, activeMembership.id));
      } else {
        await db.insert(clanMemberships).values({
          playerId: savedPlayer.id,
          clanId: savedClan.id,
          role: savedPlayer.role,
          status: "active",
          joinedAt: new Date(),
        });
      }
    }

    const activeMemberships = await db.select().from(clanMemberships).where(and(
      eq(clanMemberships.clanId, savedClan.id),
      eq(clanMemberships.status, "active"),
      isNull(clanMemberships.leftAt),
    ));
    const currentTags = new Set(members.map((member) => normalizeClanTag(member.tag)));
    for (const membership of activeMemberships) {
      const [player] = await db.select().from(players).where(eq(players.id, membership.playerId)).limit(1);
      if (player && !currentTags.has(player.playerTag)) {
        await db.update(clanMemberships).set({
          status: "inactive",
          leftAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(clanMemberships.id, membership.id));
      }
    }

    return NextResponse.json({
      clan: savedClan,
      memberCount: members.length,
      message: `${clanData.name} imported with ${members.length} members.`,
    }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to import clan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
