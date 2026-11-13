import Link from "next/link";
import { ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { players } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PageProps = { searchParams: Promise<{ q?: string }> };

export default async function MembersPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const search = q.trim().slice(0, 100);
  const allPlayers = search
    ? await db.select().from(players).where(ilike(players.name, `%${search}%`)).orderBy(players.name)
    : await db.select().from(players).orderBy(players.name);

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Members</h1><p className="text-muted-foreground">Search player profiles and saved war performance across all clans.</p></div>
      <Card><CardHeader><CardTitle>Find a player</CardTitle></CardHeader><CardContent>
        <form action="/members" method="GET" className="flex flex-col gap-2 sm:flex-row">
          <Input name="q" defaultValue={search} placeholder="Search player by name..." className="sm:max-w-md" />
          <Button type="submit">Search</Button>
          {search && <Link href="/members" className="self-center text-sm text-muted-foreground hover:underline">Clear</Link>}
        </form>
        <p className="mt-2 text-xs text-muted-foreground">{allPlayers.length} player(s) found</p>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Player list</CardTitle></CardHeader><CardContent>
        {allPlayers.length === 0 ? <p className="text-muted-foreground">No players found. Try another name or wait for the administrator to sync a clan.</p> : (
          <Table><TableHeader><TableRow><TableHead>Player</TableHead><TableHead>Tag</TableHead><TableHead>Town Hall</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
            <TableBody>{allPlayers.map((player) => <TableRow key={player.id}><TableCell><Link className="text-primary hover:underline" href={`/members/${player.id}`}>{player.name}</Link></TableCell><TableCell className="font-mono">#{player.playerTag}</TableCell><TableCell>{player.townHallLevel}</TableCell><TableCell>{player.role}</TableCell></TableRow>)}</TableBody>
          </Table>
        )}
      </CardContent></Card>
    </div>
  );
}