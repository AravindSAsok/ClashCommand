"use client";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clans } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default async function ClansPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/(auth)/login");

  const allClans = await db.select().from(clans).orderBy(clans.createdAt);
  const [createName, setCreateName] = useState("");
  const [createTag, setCreateTag] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/clans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          tag: createTag,
        }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create clan");
      }
    } catch {
      alert("Failed to create clan");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clans</h1>
          <p className="text-muted-foreground">Manage your Clash of Clans clans.</p>
        </div>
        <Button href="/(app)/clans/new">New Clan</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allClans.length > 0 ? (
          allClans.map((clan) => (
            <Card key={clan.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-border/50 px-2 py-1 rounded border border-border">
                    #{clan.tag}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Level {clan.clanLevel}
                  </span>
                </div>
                <CardTitle className="text-lg">{clan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{clan.warLeague}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm">
                  <span className={clan.isActive ? "text-green-500" : "text-muted-foreground"}>
                    {clan.isActive ? "Active" : "Archived"}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(clan.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No clans yet.</p>
            <Button onClick={() => {}} variant="outline">Create your first clan</Button>
          </div>
        )}
      </div>

      <div className="mt-8 border-t pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Create Clan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Clan Name</label>
                <Input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Reddit Clan"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Clan Tag</label>
                <Input
                  value={createTag}
                  onChange={(e) => setCreateTag(e.target.value)}
                  placeholder="#TAG"
                  required
                />
              </div>
              <Button type="submit" className="col-span-1 md:col-span-1" disabled={creating}>
                {creating ? "Creating..." : "Create Clan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}