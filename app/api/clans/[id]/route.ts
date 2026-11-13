import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clans } from "@/db/schema";
import { clanSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const [clan] = await db.select().from(clans).where(eq(clans.id, id)).limit(1);
    if (!clan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    return NextResponse.json(clan);
  } catch {
    return NextResponse.json({ error: "Failed to fetch clan" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  try {
    const { id } = await params;
    const validated = clanSchema.parse(await req.json());
    const normalizedTag = validated.tag.replace(/#/g, "").toUpperCase();
    const [updatedClan] = await db.update(clans).set({
      ...validated,
      tag: normalizedTag,
      updatedAt: new Date(),
    }).where(eq(clans.id, id)).returning();
    if (!updatedClan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    return NextResponse.json(updatedClan);
  } catch (error: any) {
    if (error.message?.includes("unique")) return NextResponse.json({ error: "Clan tag already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to update clan" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  try {
    const { id } = await params;
    const [updatedClan] = await db.update(clans)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(clans.id, id)).returning();
    if (!updatedClan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    return NextResponse.json({ message: "Clan archived" });
  } catch {
    return NextResponse.json({ error: "Failed to archive clan" }, { status: 500 });
  }
}