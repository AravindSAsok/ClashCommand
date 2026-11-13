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
      // The website only reads saved Neon data. Supercell syncing is done by the local admin script.
      const response = await fetch(`/api/clans/${clanId}/wars`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load saved wars");
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load saved wars");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadWars(); }, [clanId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Saved war activity</h2>
        <Button variant="outline" size="sm" onClick={loadWars} disabled={loading}>{loading ? "Loading..." : "Refresh saved data"}</Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading && !data && <p className="text-sm text-muted-foreground">Loading saved war data...</p>}
      {data?.currentWar && (
        <Card>
          <CardHeader><CardTitle>Latest war · {data.currentWar.state}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span>{data.currentWar.clan?.name} vs {data.currentWar.opponent?.name}</span>
              <span>{data.currentWar.clan?.stars ?? 0} - {data.currentWar.opponent?.stars ?? 0} stars</span>
            </div>
            <div className="space-y-2">
              {(data.currentWar.clan?.members || []).map((member: any) => (
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
        <CardHeader><CardTitle>Saved wars</CardTitle></CardHeader>
        <CardContent>
          {!loading && data?.warLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No wars have been saved yet. The administrator can run the local sync script during a war.</p>
          ) : (
            <div className="space-y-3">
              {data?.warLog.map((war: any, index: number) => {
                const ours = war.clan || {};
                const opponent = war.opponent || {};
                return (
                  <div key={`${war.endTime || index}-${opponent.tag || index}`} className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 text-sm last:border-0">
                    <div>
                      <p className="font-medium">vs {opponent.name || "Unknown clan"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(war.endTime)} · {war.teamSize || "?"} vs {war.teamSize || "?"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{ours.stars ?? 0} - {opponent.stars ?? 0} stars</p>
                      <p className="text-xs capitalize text-muted-foreground">{ours.result || "in progress"} · {ours.destructionPercentage ?? 0}% destruction</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Player attack history is saved by the local sync script. Supercell's public war log does not expose individual attacks for older wars.</p>
        </CardContent>
      </Card>
    </div>
  );
}