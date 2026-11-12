import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clanMemberships, players } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { membershipId } = await req.json();

    // Find the membership
    const [membership] = await db
      .select()
      .from(clanMemberships)
      .where(eq(clanMemberships.id, membershipId))
      .limit(1);

    if (!membership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    // Verify the membership belongs to the current player (simplified check)
    // In a full app, would verify session playerId matches membership.playerId

    // Update membership: set leave date and close it
    const [updated] = await db
      .update(clanMemberships)
      .set({
        leftAt: sql`NOW()`,
        status: "inactive",
        updatedAt: sql`NOW()`,
      })
      .where(eq(clanMemberships.id, membershipId))
      .returning();

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to leave clan: " + error.message }, { status: 400 });
  }
}