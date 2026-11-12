import { db } from "@/lib/db";
import { clans } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { clanSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const clanTag = searchParams.get("clanTag");

  try {
    if (action === "list") {
      const data = await db.select().from(clans).orderBy(clans.name);
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "by-tag") {
      if (!clanTag) {
        return new Response(JSON.stringify({ success: false, error: "clanTag required" }), {
          status: 400,
        });
      }
      const data = await db.select().from(clans).where(eq(clans.tag, clanTag)).limit(1);
      if (data.length === 0) {
        return new Response(JSON.stringify({ success: false, error: "Clan not found" }), {
          status: 404,
        });
      }
      return new Response(JSON.stringify({ success: true, data: data[0] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "create") {
      // Parse and validate input
      const body = await request.json();
      const result = clanSchema.safeParse(body);
      if (!result.success) {
        return new Response(JSON.stringify({ success: false, error: result.error.format }), {
          status: 400,
        });
      }
      const data = await db.insert(clans).values({
        name: result.data.name,
        tag: result.data.tag,
        description: result.data.description,
        clanLevel: result.data.clanLevel,
        warLeague: result.data.warLeague,
        location: result.data.location,
        isActive: result.data.isActive,
        notes: result.data.notes,
      }).returning();
      return new Response(JSON.stringify({ success: true, data }), {
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