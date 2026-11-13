import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { players, clanMemberships } from "@/db/schema";
import { playerSchema, clanMembershipSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const allPlayers = await db.select({
      id: players.id,
      playerTag: players.playerTag,
      name: players.name,
      townHallLevel: players.townHallLevel,
      role: players.role,
      profileImageUrl: players.profileImageUrl,
      notes: players.notes,
      createdAt: players.createdAt,
      updatedAt: players.updatedAt,
    }).from(players).orderBy(players.createdAt);
    return NextResponse.json(allPlayers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  try {
    const body = await req.json();
    const validatedPlayer = playerSchema.parse(body.player);
    const validatedMembership = clanMembershipSchema.parse(body.membership);
    const normalizedTag = validatedPlayer.playerTag.replace(/#/g, "").toUpperCase();
    const result = await db.transaction(async (tx) => {
      const [newPlayer] = await tx.insert(players).values({
        ...validatedPlayer,
        playerTag: normalizedTag,
      }).returning();
      await tx.insert(clanMemberships).values({
        ...validatedMembership,
        playerId: newPlayer.id,
      });
      return newPlayer;
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes("unique")) return NextResponse.json({ error: "Player tag already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create player" }, { status: 400 });
  }
}