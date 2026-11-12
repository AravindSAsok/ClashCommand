import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your clans, members, and wars.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Clans" value="0" />
        <StatCard title="Active Members" value="0" />
        <StatCard title="Total Wars" value="0" />
        <StatCard title="Win Rate" value="0%" />
      </div>
      <Card>
        <CardHeader><CardTitle>Getting started</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-muted-foreground">
          <p>Your Clash Command workspace is ready.</p>
          <p>Add a clan, then add members and record your wars.</p>
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
          <Badge variant="outline">MVP</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
