import { db } from "@/lib/db";
import { wars } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WarsPage() {
  const allWars = await db.select().from(wars).orderBy(wars.startAt);
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Wars</h1><p className="text-muted-foreground">War history and results.</p></div>
      <Card><CardHeader><CardTitle>Recorded wars</CardTitle></CardHeader><CardContent>
        {allWars.length === 0 ? <p className="text-muted-foreground">No wars recorded yet. Add a war to start tracking results.</p> : (
          <div className="space-y-3">{allWars.map((war) => <div key={war.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3"><div><p className="font-medium">vs. {war.opponentName}</p><p className="text-sm text-muted-foreground">{war.warType.toUpperCase()} · {new Date(war.startAt).toLocaleDateString()}</p></div><div className="text-right"><p className="font-semibold">{war.ourStars} - {war.opponentStars}</p><p className="text-sm text-muted-foreground">{war.result ?? war.status}</p></div></div>)}</div>
        )}
      </CardContent></Card>
    </div>
  );
}
