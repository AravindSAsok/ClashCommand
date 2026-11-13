"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RemoveClanMemberButton({
  clanId,
  playerId,
  playerName,
}: {
  clanId: string;
  playerId: string;
  playerName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function removeMember() {
    if (!window.confirm(`Remove ${playerName} from this clan? Their player profile and saved war history will be kept.`)) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/clans/${clanId}/members/${playerId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not remove player.");
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not remove player.");
    } finally {
      setLoading(false);
    }
  }

  return <Button type="button" size="sm" variant="outline" disabled={loading} onClick={removeMember}>{loading ? "Removing..." : "Remove"}</Button>;
}