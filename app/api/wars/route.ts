import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { wars } from "@/db/schema";
import { warSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allWars = await db
      .select()
      .from(wars)
      .orderBy(wars.startAt);
    return NextResponse.json(allWars);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch wars" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = warSchema.parse(body);

    const [newWar] = await db.insert(wars).values(validated).returning();

    return NextResponse.json(newWar, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create war" }, { status: 400 });
  }
}