import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clanMemberships, players } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { playerId, newRole, destinationClanId } = await req.json();

    // Run transactional transfer
    const result = await db.transaction(async (tx) => {
      // 1. Find player's current active membership
      const [currentMembership] = await tx
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

      if (!currentMembership) {
        throw new Error("No active membership found for player");
      }

      // 2. Close current membership
      await tx
        .update(clanMemberships)
        .set({
          leftAt: sql`NOW()`,
          status: "inactive",
          updatedAt: sql`NOW()`,
        })
        .where(eq(clanMemberships.id, currentMembership.id));

      // 3. Create new membership in destination clan
      const [newMembership] = await tx
        .insert(clanMemberships)
        .values({
          playerId,
          clanId: destinationClanId,
          role: newRole || "member",
          status: "active",
          joinedAt: sql`NOW()`,
        })
        .returning();

      return newMembership;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Transfer failed: " + error.message }, { status: 400 });
  }
}