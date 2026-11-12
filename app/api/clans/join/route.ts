import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clanMemberships, players, clans } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { playerId, clanId, role } = await req.json();
    if (!playerId || !clanId) {
      return NextResponse.json({ error: "Player ID and clan ID are required" }, { status: 400 });
    }

    const existingActive = await db.select().from(clanMemberships).where(and(
      eq(clanMemberships.playerId, playerId),
      eq(clanMemberships.status, "active"),
      isNull(clanMemberships.leftAt),
    )).limit(1);
    if (existingActive.length > 0) {
      return NextResponse.json({ error: "Player already has an active clan membership" }, { status: 400 });
    }

    const [player] = await db.select().from(players).where(eq(players.id, playerId)).limit(1);
    if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });

    const [clan] = await db.select().from(clans).where(eq(clans.id, clanId)).limit(1);
    if (!clan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });

    const [newMembership] = await db.insert(clanMemberships).values({
      playerId,
      clanId,
      role: role || "member",
      status: "active",
      joinedAt: new Date(),
    }).returning();
    return NextResponse.json(newMembership, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to join clan" }, { status: 400 });
  }
}
