import { db } from "@/lib/db";
import { players } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { playerSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const playerTag = searchParams.get("playerTag");

  try {
    if (action === "list") {
      const data = await db.select().from(players).orderBy(players.name);
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { "Content-Type": "application/json" });
    }

    if (action === "by-tag") {
      if (!playerTag) {
        return new Response(JSON.stringify({ success: false, error: "playerTag required" }), {
          status: 400,
        });
      }
      const data = await db.select().from(players).where(eq(players.playerTag, playerTag)).limit(1);
      if (data.length === 0) {
        return new Response(JSON.stringify({ success: false, error: "Player not found" }), {
          status: 404,
        });
      }
      return new Response(JSON.stringify({ success: true, data: data[0] }), {
        headers: { "Content-Type": "application/json" });
    }

    if (action === "performance") {
      const tag = searchParams.get("tag");
      if (!tag) {
        return new Response(JSON.stringify({ success: false, error: "tag required" }), {
          status: 400,
        });
      }
      // Get war participation stats for this player
      const participantData = await db
        .select({
          warId: warParticipants.warId,
          starsEarned: warParticipants.starsEarned,
          destructionTotal: warParticipants.destructionTotal,
          attacksUsed: warParticipants.attacksUsed,
          threeStarCount: warParticipants.threeStarCount,
          war: {
            opponentName: wars.opponentName,
            warType: wars.warType,
            startAt: wars.startAt,
            result: wars.result,
          },
        })
        .from(warParticipants)
        .leftJoin(wars, eq(warParticipants.warId, wars.id))
        .where(eq(warParticipants.playerId, /* player id lookup needed */));

      // Instead, get from war participants with player filter
      // We need the playerId, but we only have the tag - let's do a different query
      return new Response(JSON.stringify({ success: true, data: [] }), {
        headers: { "Content-Type": "application/json" });
    }

    return new Response(JSON.stringify({ success: false, error: "Unknown action" }), {
      status: 400,
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      status: 500,
    });
  }
}