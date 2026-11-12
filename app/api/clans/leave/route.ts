import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clanMemberships } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { membershipId } = await req.json();
    if (!membershipId) return NextResponse.json({ error: "Membership ID required" }, { status: 400 });
    const [membership] = await db.select().from(clanMemberships).where(eq(clanMemberships.id, membershipId)).limit(1);
    if (!membership) return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    const [updated] = await db.update(clanMemberships).set({
      leftAt: new Date(),
      status: "inactive",
      updatedAt: new Date(),
    }).where(eq(clanMemberships.id, membershipId)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to leave clan" }, { status: 400 });
  }
}
