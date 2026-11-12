"use client";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { players } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default async function MembersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/(auth)/login");

  const allPlayers = await db.select().from(players).orderBy(players.createdAt);
  const [search, setSearch] = useState("");

  const filtered = allPlayers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.playerTag.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">Manage clan members and player profiles.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <div className="rounded-xl border border-input bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Tag</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-16">TH</TableHead>
              <TableHead className="w-24">Role</TableHead>
              <TableHead className="w-32">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-mono text-sm">#{player.playerTag}</TableCell>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell className="text-center">{player.townHallLevel}</TableCell>
                  <TableCell className="text-capitalize">{player.role}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(player.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {allPlayers.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No members yet. Add players to start tracking their performance.
          </CardContent>
        </Card>
      )}
    </div>
  );
}