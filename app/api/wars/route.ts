import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { wars } from "@/db/schema";
import { warSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const allWars = await db.select().from(wars).orderBy(wars.startAt);
    return NextResponse.json(allWars);
  } catch {
    return NextResponse.json({ error: "Failed to fetch wars" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  try {
    const validated = warSchema.parse(await req.json());
    const [newWar] = await db.insert(wars).values(validated).returning();
    return NextResponse.json(newWar, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create war" }, { status: 400 });
  }
}