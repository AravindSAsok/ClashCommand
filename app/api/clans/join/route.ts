import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clanMemberships, players, clans } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { playerId, role } = await req.json();

    // Check player has no active membership
    const existingActive = await db
      .select()
      .from(clanMemberships)
      .where(
        and(
          eq(clanMemberships.playerId, playerId),
          eq(clanMemberships.status, "active"),
          isNull(clanMemberships.leftAt, sql`NULL`)
        )
      )
      .limit(1);

    if (existingActive.length > 0) {
      return NextResponse.json(
        { error: "Player already has an active clan membership" },
        { status: 400 }
      );
    }

    // Get the player to verify they exist
    const [p] = await db
      .select()
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    if (!p) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Create new membership
    const [newMembership] = await db
      .insert(clanMemberships)
      .values({
        playerId,
        role: role || "member",
        status: "active",
        joinedAt: sql`NOW()`,
      })
      .returning();

    return NextResponse.json(newMembership, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to join clan: " + error.message }, { status: 400 });
  }
}