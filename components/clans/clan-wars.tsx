"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type WarData = { warLog: any[]; currentWar: any | null; warLogError: string | null };

function formatDate(value?: string) {
  if (!value) return "Date unavailable";
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.?(\d*)Z$/);
  const date = match
    ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]), Number(match[6])))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function ClanWars({ clanId }: { clanId: string }) {
  const [data, setData] = useState<WarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWars() {
    setLoading(true);
    setError("");
    try {
      // Save the live war snapshot before displaying it, so player profiles build history over time.
      // Sync is best-effort: a private/unavailable current war must not hide the public clan war log.
      await fetch(`/api/clans/${clanId}/wars/sync`, { method: "POST" }).catch(() => null);
      const response = await fetch(`/api/clans/${clanId}/wars`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load wars");
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load wars");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadWars(); }, [clanId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">War activity</h2>
        <Button variant="outline" size="sm" onClick={loadWars} disabled={loading}>{loading ? "Refreshing..." : "Refresh wars"}</Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading && !data && <p className="text-sm text-muted-foreground">Loading war data...</p>}
      {data?.currentWar && (
        <Card>
          <CardHeader><CardTitle>Current war · {data.currentWar.state}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span>{data.currentWar.clan?.name} vs {data.currentWar.opponent?.name}</span>
              <span>{data.currentWar.clan?.stars ?? 0} - {data.currentWar.opponent?.stars ?? 0} stars</span>
            </div>
            <div className="space-y-2">
              {(data.currentWar.clan?.members || []).slice().sort((a: any, b: any) => a.mapPosition - b.mapPosition).map((member: any) => (
                <div key={member.tag} className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0">
                  <span>{member.name} <span className="text-muted-foreground">#{member.tag}</span></span>
                  <span>{(member.attacks || []).length} attacks · {(member.attacks || []).reduce((sum: number, attack: any) => sum + attack.stars, 0)} stars</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Recent wars</CardTitle></CardHeader>
        <CardContent>
          {data?.warLogError && <p className="mb-3 text-sm text-muted-foreground">{data.warLogError}</p>}
          {!loading && data?.warLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No public war history was returned. The clan may have a private war log.</p>
          ) : (
            <div className="space-y-3">
              {data?.warLog.map((war: any, index: number) => {
                const ours = war.clan || {};
                const opponent = war.opponent || {};
                const result = ours.result || "unknown";
                return (
                  <div key={`${war.endTime || index}-${opponent.tag || index}`} className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 text-sm last:border-0">
                    <div>
                      <p className="font-medium">vs {opponent.name || "Unknown clan"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(war.endTime)} · {war.teamSize || "?"} vs {war.teamSize || "?"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{ours.stars ?? 0} - {opponent.stars ?? 0} stars</p>
                      <p className="text-xs capitalize text-muted-foreground">{result} · {ours.destructionPercentage ?? 0}% destruction</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Player attack history is saved from live wars as they happen. Older clan war-log entries do not contain individual attack data.</p>
        </CardContent>
      </Card>
    </div>
  );
}
