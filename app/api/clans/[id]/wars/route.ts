import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clans } from "@/db/schema";
import { clashApi, normalizeClanTag } from "@/lib/clash-api";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const [clan] = await db.select().from(clans).where(eq(clans.id, id)).limit(1);
    if (!clan) return NextResponse.json({ error: "Clan not found" }, { status: 404 });

    const encodedTag = encodeURIComponent(`#${normalizeClanTag(clan.tag)}`);
    const [warLogResult, currentWarResult] = await Promise.allSettled([
      clashApi<{ items: any[] }>(`/clans/${encodedTag}/warlog?limit=10`),
      clashApi<any>(`/clans/${encodedTag}/currentwar`),
    ]);

    const warLog = warLogResult.status === "fulfilled" ? warLogResult.value.items || [] : [];
    const currentWar = currentWarResult.status === "fulfilled" &&
      currentWarResult.value.state && currentWarResult.value.state !== "notInWar"
      ? currentWarResult.value : null;

    const warLogError = warLogResult.status === "rejected"
      ? (warLogResult.reason instanceof Error ? warLogResult.reason.message : "War log unavailable")
      : null;

    return NextResponse.json({ warLog, currentWar, warLogError });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load wars" }, { status: 400 });
  }
}
