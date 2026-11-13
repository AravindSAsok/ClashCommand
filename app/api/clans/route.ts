import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clans } from "@/db/schema";
import { clanSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const allClans = await db.select().from(clans).where(eq(clans.isActive, true)).orderBy(clans.createdAt);
    return NextResponse.json(allClans);
  } catch {
    return NextResponse.json({ error: "Failed to fetch clans" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  try {
    const body = await req.json();
    const validated = clanSchema.parse(body);
    const normalizedTag = validated.tag.replace(/#/g, "").toUpperCase();
    const [newClan] = await db.insert(clans).values({
      ...validated,
      tag: normalizedTag,
      createdBy: session.user.id,
    }).returning();
    return NextResponse.json(newClan, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes("unique")) return NextResponse.json({ error: "Clan tag already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create clan" }, { status: 400 });
  }
}