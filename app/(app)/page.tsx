import { getSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/(auth)/login");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your clans, members, and wars.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/(app)/clans" className="hidden sm:flex">
            <Badge variant="outline">Manage Clans</Badge>
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Clans" value="0" trend="0" />
        <StatCard title="Active Members" value="0" trend="0" />
        <StatCard title="Total Wars" value="0" trend="0" />
        <StatCard title="Win Rate" value="0%" trend="0" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Wars</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 text-center text-muted-foreground">
              No wars recorded yet. Create your first war to get started.
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Member Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 text-center text-muted-foreground">
              No member activity yet. Add members to your clans.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  trend,
}: {
  title: string;
  value: string | number;
  trend: string | number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          <Badge
            variant={Number(trend) >= 0 ? "default" : "destructive"}
            className="ml-auto"
          >
            {trend >= 0 ? "+" : ""}{trend}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}