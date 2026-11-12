import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { clans, clanMemberships, players } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClanWars } from "@/components/clans/clan-wars";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClanDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const [clan] = await db.select().from(clans).where(eq(clans.id, id)).limit(1);
  if (!clan) notFound();

  const members = await db.select({
    id: players.id,
    name: players.name,
    playerTag: players.playerTag,
    townHallLevel: players.townHallLevel,
    role: clanMemberships.role,
  }).from(clanMemberships)
    .innerJoin(players, eq(clanMemberships.playerId, players.id))
    .where(and(eq(clanMemberships.clanId, id), eq(clanMemberships.status, "active"), isNull(clanMemberships.leftAt)))
    .orderBy(players.name);

  return (
    <div className="space-y-6">
      <div><Link href="/clans" className="text-sm text-muted-foreground hover:underline">← Back to clans</Link>
        <h1 className="mt-2 text-3xl font-bold">{clan.name}</h1>
        <p className="font-mono text-sm text-muted-foreground">#{clan.tag} · Level {clan.clanLevel} · {clan.location || "Location not set"}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Members</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{members.length}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Clan level</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{clan.clanLevel}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">War league</CardTitle></CardHeader><CardContent className="text-2xl font-bold capitalize">{clan.warLeague}</CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Clan members</CardTitle></CardHeader>
        <CardContent>
          {members.length === 0 ? <p className="text-sm text-muted-foreground">No members imported yet. Return to Clans and refresh the clan.</p> : (
            <Table><TableHeader><TableRow><TableHead>Player</TableHead><TableHead>Player tag</TableHead><TableHead>Town Hall</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
              <TableBody>{members.map((member) => <TableRow key={member.id}>
                <TableCell className="font-medium"><Link className="hover:underline text-primary" href={`/members/${member.id}`}>{member.name}</Link></TableCell>
                <TableCell className="font-mono text-xs">#{member.playerTag}</TableCell>
                <TableCell>TH {member.townHallLevel}</TableCell>
                <TableCell className="capitalize">{member.role.replace("_", " ")}</TableCell>
              </TableRow>)}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ClanWars clanId={clan.id} />
    </div>
  );
}
