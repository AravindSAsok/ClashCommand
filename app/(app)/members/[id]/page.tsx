import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { players, warParticipants, wars, warAttacks } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageProps = { params: Promise<{ id: string }> };

export default async function PlayerDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const [player] = await db.select().from(players).where(eq(players.id, id)).limit(1);
  if (!player) notFound();

  const history = await db.select({
    participantId: warParticipants.id,
    attacksUsed: warParticipants.attacksUsed,
    starsEarned: warParticipants.starsEarned,
    destructionTotal: warParticipants.destructionTotal,
    threeStarCount: warParticipants.threeStarCount,
    opponentName: wars.opponentName,
    opponentTag: wars.opponentTag,
    startAt: wars.startAt,
    endAt: wars.endAt,
    status: wars.status,
    result: wars.result,
    ourStars: wars.ourStars,
    opponentStars: wars.opponentStars,
  }).from(warParticipants)
    .innerJoin(wars, eq(warParticipants.warId, wars.id))
    .where(eq(warParticipants.playerId, player.id))
    .orderBy(desc(wars.startAt));

  const attackRows = await Promise.all(history.map(async (war) => ({
    ...war,
    attacks: await db.select().from(warAttacks)
      .where(eq(warAttacks.participantId, war.participantId))
      .orderBy(warAttacks.attackNumber),
  })));

  const totalAttacks = history.reduce((sum, war) => sum + war.attacksUsed, 0);
  const totalStars = history.reduce((sum, war) => sum + war.starsEarned, 0);
  const totalTriples = history.reduce((sum, war) => sum + war.threeStarCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/members" className="text-sm text-muted-foreground hover:underline">← Back to members</Link>
        <h1 className="mt-2 text-3xl font-bold">{player.name}</h1>
        <p className="font-mono text-sm text-muted-foreground">#{player.playerTag} · Town Hall {player.townHallLevel} · {player.role.replace("_", " ")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">War attacks</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totalAttacks}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Stars earned</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totalStars}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Three-star attacks</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totalTriples}</CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>War history</CardTitle></CardHeader>
        <CardContent>
          {attackRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved player war history yet. Open your clan page during an active war and refresh War activity to save member attacks. Older wars cannot be imported with individual attacks from Supercell's public war log.</p>
          ) : (
            <div className="space-y-5">
              {attackRows.map((war) => (
                <div key={war.participantId} className="space-y-2 border-b pb-4 last:border-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div><p className="font-semibold">vs {war.opponentName}</p><p className="text-xs text-muted-foreground">{war.startAt.toLocaleDateString()} · {war.status}</p></div>
                    <div className="text-right"><p className="font-semibold">{war.starsEarned} stars · {war.attacksUsed} attacks</p><p className="text-xs text-muted-foreground">{war.threeStarCount} triples · {war.destructionTotal}% combined destruction</p></div>
                  </div>
                  {war.attacks.length > 0 && <div className="space-y-1 pl-3 text-sm text-muted-foreground">{war.attacks.map((attack) => <p key={attack.id}>Attack {attack.attackNumber}: {attack.stars} stars · {attack.destruction}% destruction · defender position {attack.defenderPosition}</p>)}</div>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
