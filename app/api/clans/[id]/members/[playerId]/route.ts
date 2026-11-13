import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, eq, isNull } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clanMemberships, clans, players } from "@/db/schema";

type RouteContext = { params: Promise<{ id: string; playerId: string }> };

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  try {
    const { id: clanId, playerId } = await params;
    const [membership] = await db.select({ id: clanMemberships.id })
      .from(clanMemberships)
      .innerJoin(clans, eq(clanMemberships.clanId, clans.id))
      .innerJoin(players, eq(clanMemberships.playerId, players.id))
      .where(and(
        eq(clanMemberships.clanId, clanId),
        eq(clanMemberships.playerId, playerId),
        eq(clanMemberships.status, "active"),
        isNull(clanMemberships.leftAt),
      ))
      .limit(1);

    if (!membership) return NextResponse.json({ error: "Active clan membership not found" }, { status: 404 });

    await db.update(clanMemberships).set({
      status: "inactive",
      leftAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(clanMemberships.id, membership.id));

    return NextResponse.json({ message: "Player removed from clan. Player profile and war history were preserved." });
  } catch {
    return NextResponse.json({ error: "Could not remove player from clan." }, { status: 500 });
  }
}