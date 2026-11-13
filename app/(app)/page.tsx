import { count, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { clans, clanMemberships, wars } from "@/db/schema";

export default async function DashboardPage() {
  const [[clanStats], [memberStats], [warStats], [winStats]] = await Promise.all([
    db.select({ total: count() }).from(clans).where(eq(clans.isActive, true)),
    db.select({ total: count() }).from(clanMemberships).where(eq(clanMemberships.status, "active")),
    db.select({ total: count() }).from(wars),
    db.select({ total: count() }).from(wars).where(eq(wars.result, "win")),
  ]);
  const totalWars = Number(warStats.total);
  const winRate = totalWars ? Math.round((Number(winStats.total) / totalWars) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of saved clans, members, and wars.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Clans" value={String(clanStats.total)} />
        <StatCard title="Active Memberships" value={String(memberStats.total)} />
        <StatCard title="Saved Wars" value={String(totalWars)} />
        <StatCard title="Win Rate" value={`${winRate}%`} />
      </div>
      <Card>
        <CardHeader><CardTitle>Data sync</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-muted-foreground">
          <p>This website displays data saved in the shared Neon database.</p>
          <p>The administrator runs <code>npm run sync:clans</code> locally to refresh every saved clan and capture available war attacks.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-medium">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{value}</span>
          <Badge variant="outline">Live from Neon</Badge>
        </div>
      </CardContent>
    </Card>
  );
}