const API_BASE = "https://api.clashofclans.com/v1";

export function normalizeClanTag(tag: string) {
  return tag.replace(/#/g, "").trim().toUpperCase();
}

export async function clashApi<T>(path: string): Promise<T> {
  const apiKey = process.env.COC_API_KEY;
  if (!apiKey) throw new Error("COC_API_KEY is missing. Add your Supercell API key to .env.");

  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    if (response.status === 403) {
      throw new Error("Supercell API access denied. Check that your API key is valid and its allowed IP address matches your current public IP.");
    }
    if (response.status === 404) throw new Error("Clash of Clans data was not found. Check the clan tag and whether its war log is public.");
    if (response.status === 429) throw new Error("Supercell API rate limit reached. Please wait and try again.");
    throw new Error(detail?.message || `Supercell API request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

export type CocClan = {
  tag: string; name: string; clanLevel: number; warLeague?: { name: string };
  location?: { name: string }; badgeUrls?: { medium?: string; large?: string };
  members?: number; points?: number; requiredTrophies?: number;
};
export type CocMember = {
  tag: string; name: string; role: string; expLevel: number; trophies: number; townHallLevel?: number;
  donations: number; donationsReceived: number; clanRank?: number; league?: { name: string };
  builderBaseTrophies?: number;
};
