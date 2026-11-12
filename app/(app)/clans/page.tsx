import { db } from "@/lib/db";
import { clans } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ClansPage() {
  const allClans = await db.select().from(clans).orderBy(clans.name);
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Clans</h1><p className="text-muted-foreground">Your registered Clash of Clans clans.</p></div>
      {allClans.length === 0 ? (
        <Card><CardHeader><CardTitle>No clans yet</CardTitle></CardHeader><CardContent className="text-muted-foreground">Your workspace is ready. Add your first clan using the clan API.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {allClans.map((clan) => <Card key={clan.id}><CardHeader><CardTitle>{clan.name}</CardTitle><p className="font-mono text-sm text-muted-foreground">#{clan.tag}</p></CardHeader><CardContent className="flex justify-between text-sm"><span>Level {clan.clanLevel}</span><span>{clan.warLeague}</span></CardContent></Card>)}
        </div>
      )}
    </div>
  );
}
