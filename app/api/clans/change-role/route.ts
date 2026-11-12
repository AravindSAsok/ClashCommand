import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clanMemberships } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { membershipId, newRole } = await req.json();

    // Validate role is valid
    const validRoles = ["leader", "co_leader", "elder", "member"];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update membership role - this is the authoritative role for this clan membership
    const [updated] = await db
      .update(clanMemberships)
      .set({
        role: newRole,
        updatedAt: sql`NOW()`,
      })
      .where(eq(clanMemberships.id, membershipId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to change role: " + error.message }, { status: 400 });
  }
}