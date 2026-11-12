import { db } from "@/lib/db";
import { clans, players, wars } from "@/db/schema";
import { eq, sql, count, avg, desc, gte, lte, and, or } from "drizzle-orm";
import { z } from "zod";
import { clanSchema, playerSchema, warSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const clanTag = searchParams.get("clanTag");
  const warType = searchParams.get("warType");
  const recent = searchParams.get("recent");
  const limitVal = searchParams.get("limit") || "50";

  try {
    if (action === "list") {
      const limit = parseInt(limitVal);
      const offset = parseInt(searchParams.get("offset") || "0");

      let whereCondition: any = {};

      // Filter by war type (regular or CWL)
      if (warType === "regular") {
        whereCondition.warType = "normal";
      } else if (warType === "cwl") {
        whereCondition.warType = "cwl";
      }

      // Filter by recency
      if (recent) {
        const days = parseInt(recent);
        if (!isNaN(days) && days > 0) {
          whereCondition.startAt = gte(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
        }
      }

      if (clanTag) {
        whereCondition.clanTag = clanTag;
      }

      const data = await db
        .select({
          id: wars.id,
          clanId: wars.clanId,
          opponentName: wars.opponentName,
          warType: wars.warType,
          status: wars.status,
          startAt: wars.startAt,
          ourStars: wars.ourStars,
          opponentStars: wars.opponentStars,
          ourDestruction: wars.ourDestruction,
          opponentDestruction: wars.opponentDestruction,
          result: wars.result,
        })
        .from(wars)
        .where(whereCondition)
        .orderBy(desc(wars.startAt))
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const total = await db.$count(wars, whereCondition);

      return new Response(JSON.stringify({ success: true, data, total }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "clans") {
      const data = await db.select({ id: clans.id, name: clans.name, tag: clans.tag, isActive: clans.isActive }).from(clans).orderBy(clans.name);
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { "Content-Type": "application/json" });
    }

    if (action === "players") {
      const data = await db.select({ id: players.id, playerTag: players.playerTag, name: players.name, townHallLevel: players.townHallLevel, role: players.role }).from(players).orderBy(players.name);
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { "Content-Type": "application/json" });
    }

    if (action === "recent-wars") {
      const limit = parseInt(limitVal);
      const data = await db
        .select({
          id: wars.id,
          clanId: wars.clanId,
          opponentName: wars.opponentName,
          warType: wars.warType,
          status: wars.status,
          startAt: wars.startAt,
          ourStars: wars.ourStars,
          opponentStars: wars.opponentStars,
          ourDestruction: wars.ourDestruction,
          opponentDestruction: wars.opponentDestruction,
          result: wars.result,
        })
        .from(wars)
        .orderBy(desc(wars.startAt))
        .limit(limit);

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { "Content-Type": "application/json" });
    }

    if (action === "by-clan") {
      // Get wars for a specific clan with participant stats
      const data = await db
        .select({
          warId: wars.id,
          opponentName: wars.opponentName,
          warType: wars.warType,
          status: wars.status,
          startAt: wars.startAt,
          ourStars: wars.ourStars,
          opponentStars: wars.opponentStars,
          ourDestruction: wars.ourDestruction,
          opponentDestruction: wars.opponentDestruction,
          result: wars.result,
          // Participant summary
          participantsCount: count(warParticipants.id).distinct(),
          attacksUsedSum: sum(warParticipants.attacksUsed),
        })
        .from(wars)
        .leftJoin(warParticipants, eq(warParticipants.warId, wars.id))
        .where(eq(wars.clanId, /* need clan id */))
        .groupBy(wars.id)
        .orderBy(desc(wars.startAt))
        .limit(50);

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