import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clanMemberships, clans } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { playerId, newRole, destinationClanId } = await req.json();
    if (!playerId || !destinationClanId) {
      return NextResponse.json({ error: "Player ID and destination clan ID are required" }, { status: 400 });
    }
    const [destinationClan] = await db.select().from(clans).where(eq(clans.id, destinationClanId)).limit(1);
    if (!destinationClan) return NextResponse.json({ error: "Destination clan not found" }, { status: 404 });

    const result = await db.transaction(async (tx) => {
      const [currentMembership] = await tx.select().from(clanMemberships).where(and(
        eq(clanMemberships.playerId, playerId),
        eq(clanMemberships.status, "active"),
        isNull(clanMemberships.leftAt),
      )).limit(1);
      if (!currentMembership) throw new Error("No active membership found for player");

      await tx.update(clanMemberships).set({
        leftAt: new Date(),
        status: "inactive",
        updatedAt: new Date(),
      }).where(eq(clanMemberships.id, currentMembership.id));

      const [newMembership] = await tx.insert(clanMemberships).values({
        playerId,
        clanId: destinationClanId,
        role: newRole || "member",
        status: "active",
        joinedAt: new Date(),
      }).returning();
      return newMembership;
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Transfer failed" }, { status: 400 });
  }
}
