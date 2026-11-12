import Link from "next/link";
import { db } from "@/lib/db";
import { players } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function MembersPage() {
  const allPlayers = await db.select().from(players).orderBy(players.name);
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Members</h1><p className="text-muted-foreground">Player profiles across your clans.</p></div>
      <Card><CardHeader><CardTitle>Player list</CardTitle></CardHeader><CardContent>
        {allPlayers.length === 0 ? <p className="text-muted-foreground">No members have been added yet.</p> : (
          <Table><TableHeader><TableRow><TableHead>Player</TableHead><TableHead>Tag</TableHead><TableHead>Town Hall</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
            <TableBody>{allPlayers.map((player) => <TableRow key={player.id}><TableCell><Link className="text-primary hover:underline" href={`/members/${player.id}`}>{player.name}</Link></TableCell><TableCell className="font-mono">#{player.playerTag}</TableCell><TableCell>{player.townHallLevel}</TableCell><TableCell>{player.role}</TableCell></TableRow>)}</TableBody>
          </Table>
        )}
      </CardContent></Card>
    </div>
  );
}
