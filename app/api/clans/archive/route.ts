import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clans } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { clanId } = await req.json();

    if (!clanId) {
      return NextResponse.json({ error: "Clan ID required" }, { status: 400 });
    }

    // Archive clan: set isActive=false
    // Per requirements: preserve membership history, don't delete players
    const [updated] = await db
      .update(clans)
      .set({
        isActive: false,
        updatedAt: sql`NOW()`,
      })
      .where(eq(clans.id, clanId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to archive clan: " + error.message }, { status: 400 });
  }
}