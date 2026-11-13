"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Clan = { id: string; name: string; tag: string; clanLevel: number; warLeague: string; location?: string | null };

export default function ClansPage() {
  const router = useRouter();
  const [clans, setClans] = useState<Clan[]>([]);
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadClans() {
    setListLoading(true);
    try {
      const response = await fetch("/api/clans");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load clans");
      setClans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load clans");
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    void loadClans();
    fetch("/api/auth/session").then((response) => response.json())
      .then((session) => setIsAdmin(session?.user?.role === "admin"))
      .catch(() => setIsAdmin(false));
  }, []);

  async function addClan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/clans/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not import clan");
      setMessage(data.message);
      setTag("");
      await loadClans();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import clan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clans</h1>
        <p className="text-muted-foreground">Browse the clans and their saved member and war data.</p>
      </div>
      {isAdmin && <Card>
        <CardHeader><CardTitle>Add a clan</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={addClan} className="flex flex-col gap-3 sm:flex-row">
            <Input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Clan tag, e.g. #2PP" required className="sm:max-w-sm" />
            <Button type="submit" disabled={loading}>{loading ? "Importing clan..." : "Add clan"}</Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">Imports the clan and its current roster. Run the local sync script to refresh all saved clans and capture war attacks.</p>
          {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>}
      {error && !isAdmin && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Saved clans</h2>
        {listLoading ? <p className="text-sm text-muted-foreground">Loading clans...</p> : clans.length === 0 ? (
          <Card><CardHeader><CardTitle>No clans added yet</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">The administrator has not added any clans yet.</CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {clans.map((clan) => (
              <Card key={clan.id}>
                <CardHeader><CardTitle>{clan.name}</CardTitle><p className="font-mono text-sm text-muted-foreground">#{clan.tag}</p></CardHeader>
                <CardContent className="flex items-center justify-between gap-2 text-sm">
                  <span>Level {clan.clanLevel}</span>
                  <Link href={`/clans/${clan.id}`} className="font-medium text-primary hover:underline">Members & wars →</Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}