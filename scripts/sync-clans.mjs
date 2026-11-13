import { Pool } from "pg";

const API_BASE = "https://api.clashofclans.com/v1";
const apiKey = process.env.COC_API_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!apiKey) throw new Error("COC_API_KEY is missing from .env");
if (!databaseUrl) throw new Error("DATABASE_URL is missing from .env");

const pool = new Pool({ connectionString: databaseUrl });

function normalizeTag(value = "") {
  return String(value).replace(/#/g, "").trim().toUpperCase();
}

function parseCocDate(value) {
  if (!value) return new Date();
  const match = String(value).match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.\d+)?Z$/);
  if (!match) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  return new Date(Date.UTC(
    Number(match[1]), Number(match[2]) - 1, Number(match[3]),
    Number(match[4]), Number(match[5]), Number(match[6]),
  ));
}

function playerRole(role) {
  if (role === "leader") return "leader";
  if (role === "coLeader") return "co_leader";
  if (role === "admin") return "elder";
  return "member";
}

async function coc(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || `Supercell API request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function saveCurrentWar(clan, currentWar) {
  if (!currentWar?.state || currentWar.state === "notInWar") return 0;

  const ours = currentWar.clan || {};
  const theirs = currentWar.opponent || {};
  const opponentTag = normalizeTag(theirs.tag || "") || null;
  const startAt = parseCocDate(currentWar.startTime || currentWar.preparationStartTime);
  const status = currentWar.state === "preparation"
    ? "preparation"
    : currentWar.state === "warEnded" ? "ended" : "active";

  let result = null;
  if (status === "ended") {
    if (Number(ours.stars || 0) > Number(theirs.stars || 0)) result = "win";
    else if (Number(ours.stars || 0) < Number(theirs.stars || 0)) result = "loss";
    else if (Number(ours.destructionPercentage || 0) > Number(theirs.destructionPercentage || 0)) result = "win";
    else if (Number(ours.destructionPercentage || 0) < Number(theirs.destructionPercentage || 0)) result = "loss";
    else result = "draw";
  }

  const warValues = [
    theirs.name || "Unknown clan",
    opponentTag,
    Number(currentWar.teamSize || 0) || 50,
    startAt,
    currentWar.endTime ? parseCocDate(currentWar.endTime) : null,
    status,
    Number(ours.stars || 0),
    Number(theirs.stars || 0),
    Number(ours.destructionPercentage || 0).toFixed(2),
    Number(theirs.destructionPercentage || 0).toFixed(2),
    result,
  ];

  const existing = await pool.query(
    "SELECT id FROM wars WHERE clan_id = $1 AND opponent_tag IS NOT DISTINCT FROM $2 AND start_at = $3 LIMIT 1",
    [clan.id, opponentTag, startAt],
  );

  let warId;
  if (existing.rows[0]) {
    warId = existing.rows[0].id;
    await pool.query(
      `UPDATE wars SET opponent_name=$1, opponent_tag=$2, war_size=$3, start_at=$4,
       end_at=$5, status=$6, our_stars=$7, opponent_stars=$8, our_destruction=$9,
       opponent_destruction=$10, result=$11, updated_at=NOW() WHERE id=$12`,
      [...warValues, warId],
    );
  } else {
    const inserted = await pool.query(
      `INSERT INTO wars
       (clan_id, war_type, max_attacks_per_player, opponent_name, opponent_tag, war_size,
        start_at, end_at, status, our_stars, opponent_stars, our_destruction,
        opponent_destruction, result)
       VALUES ($1, 'normal', 2, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [clan.id, ...warValues],
    );
    warId = inserted.rows[0].id;
  }

  const opponentPositions = new Map(
    (theirs.members || []).map((member) => [normalizeTag(member.tag), Number(member.mapPosition || 0)]),
  );
  let savedAttacks = 0;

  for (const member of ours.members || []) {
    const playerTag = normalizeTag(member.tag);
    const playerResult = await pool.query("SELECT id FROM players WHERE player_tag=$1 LIMIT 1", [playerTag]);
    if (!playerResult.rows[0]) continue;

    const playerId = playerResult.rows[0].id;
    const attacks = member.attacks || [];
    const participantResult = await pool.query(
      "SELECT id FROM war_participants WHERE war_id=$1 AND player_id=$2 LIMIT 1",
      [warId, playerId],
    );
    const participantValues = [
      attacks.length,
      attacks.reduce((sum, attack) => sum + Number(attack.stars || 0), 0),
      attacks.reduce((sum, attack) => sum + Number(attack.destructionPercentage || 0), 0).toFixed(2),
      attacks.filter((attack) => Number(attack.stars) === 3).length,
    ];

    let participantId;
    if (participantResult.rows[0]) {
      participantId = participantResult.rows[0].id;
      await pool.query(
        `UPDATE war_participants SET attacks_used=$1, stars_earned=$2,
         destruction_total=$3, three_star_count=$4, updated_at=NOW() WHERE id=$5`,
        [...participantValues, participantId],
      );
    } else {
      const inserted = await pool.query(
        `INSERT INTO war_participants
         (war_id, player_id, attacks_used, stars_earned, destruction_total, three_star_count)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [warId, playerId, ...participantValues],
      );
      participantId = inserted.rows[0].id;
    }

    for (const attack of attacks) {
      const attackNumber = Number(attack.order || 1);
      const defenderTag = normalizeTag(attack.defenderTag || "");
      const defenderPosition = String(opponentPositions.get(defenderTag) || defenderTag || "0");
      const attackValues = [
        defenderPosition,
        Number(attack.stars || 0),
        Math.round(Number(attack.destructionPercentage || 0)),
        Number(member.townhallLevel || 0) || null,
      ];
      const existingAttack = await pool.query(
        "SELECT id FROM war_attacks WHERE participant_id=$1 AND attack_number=$2 LIMIT 1",
        [participantId, attackNumber],
      );
      if (existingAttack.rows[0]) {
        await pool.query(
          `UPDATE war_attacks SET defender_position=$1, stars=$2, destruction=$3,
           attacker_th=$4, updated_at=NOW() WHERE id=$5`,
          [...attackValues, existingAttack.rows[0].id],
        );
      } else {
        await pool.query(
          `INSERT INTO war_attacks
           (war_id, participant_id, defender_position, attack_number, stars, destruction, attacker_th)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [warId, participantId, ...attackValues.slice(0, 1), attackNumber, ...attackValues.slice(1)],
        );
      }
      savedAttacks++;
    }
  }

  console.log(`  War saved: vs ${theirs.name || "Unknown clan"} (${status}), ${savedAttacks} attacks`);
  return savedAttacks;
}

async function syncClan(clan) {
  const tag = normalizeTag(clan.tag);
  const encodedTag = encodeURIComponent(`#${tag}`);
  console.log(`\nSyncing ${clan.name} (#${tag})...`);

  const [profile, roster] = await Promise.all([
    coc(`/clans/${encodedTag}`),
    coc(`/clans/${encodedTag}/members?limit=50`),
  ]);

  await pool.query(
    `UPDATE clans SET name=$1, clan_level=$2, location=$3, is_active=TRUE, updated_at=NOW()
     WHERE id=$4`,
    [profile.name, profile.clanLevel || 1, profile.location?.name || null, clan.id],
  );

  const members = roster.items || [];
  const currentTags = [];
  for (const member of members) {
    const playerTag = normalizeTag(member.tag);
    currentTags.push(playerTag);
    const role = playerRole(member.role);
    const playerResult = await pool.query(
      `INSERT INTO players (player_tag, name, town_hall_level, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (player_tag) DO UPDATE SET name=EXCLUDED.name,
       town_hall_level=EXCLUDED.town_hall_level, role=EXCLUDED.role, updated_at=NOW()
       RETURNING id`,
      [playerTag, member.name, member.townHallLevel || 1, role],
    );
    const playerId = playerResult.rows[0].id;
    const activeMembership = await pool.query(
      `SELECT id FROM clan_memberships
       WHERE player_id=$1 AND clan_id=$2 AND status='active' AND left_at IS NULL LIMIT 1`,
      [playerId, clan.id],
    );
    if (activeMembership.rows[0]) {
      await pool.query(
        "UPDATE clan_memberships SET role=$1, updated_at=NOW() WHERE id=$2",
        [role, activeMembership.rows[0].id],
      );
    } else {
      await pool.query(
        `INSERT INTO clan_memberships (player_id, clan_id, role, status, joined_at)
         VALUES ($1, $2, $3, 'active', NOW())`,
        [playerId, clan.id, role],
      );
    }
  }

  // Departed players are only marked inactive; their player profile and war history are preserved.
  await pool.query(
    `UPDATE clan_memberships SET status='inactive', left_at=NOW(), updated_at=NOW()
     WHERE clan_id=$1 AND status='active' AND left_at IS NULL
     AND player_id IN (SELECT id FROM players WHERE NOT (player_tag = ANY($2::varchar[])))`,
    [clan.id, currentTags],
  );
  console.log(`  Roster saved: ${members.length} current members; departed profiles preserved`);

  await wait(250);
  try {
    const currentWar = await coc(`/clans/${encodedTag}/currentwar`);
    if (currentWar.state && currentWar.state !== "notInWar") {
      await saveCurrentWar(clan, currentWar);
    } else {
      console.log("  No active/recent war available");
    }
  } catch (error) {
    console.log(`  War sync skipped: ${error.message}`);
  }
}

async function main() {
  try {
    const result = await pool.query("SELECT id, name, tag FROM clans WHERE is_active=TRUE ORDER BY created_at");
    if (!result.rows.length) {
      console.log("No active clans found in the database. Add clans first, then run this script.");
      return;
    }

    console.log(`Starting sync for ${result.rows.length} saved clan(s)...`);
    for (const clan of result.rows) {
      try {
        await syncClan(clan);
      } catch (error) {
        console.error(`  Failed to sync ${clan.name} (#${clan.tag}): ${error.message}`);
      }
      await wait(300);
    }
    console.log("\nSync finished. Refresh Clash Command to view the latest saved data.");
    console.log("Note: individual attack details are only available while Supercell exposes the current/recent war.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Sync failed:", error);
  process.exitCode = 1;
});
