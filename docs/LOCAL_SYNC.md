# Local Clash Command sync

The deployed Vercel app reads saved data from Neon. Supercell API requests are made from the administrator's local computer so the Supercell API key and allowed-IP restriction stay local.

## One-time setup

1. Pull the latest repository changes.
2. In the project root, set `DATABASE_URL` in `.env` to the same Neon PostgreSQL connection string configured in Vercel. Use the pooled Neon connection string and keep it private.
3. Set `COC_API_KEY` in the local `.env` to the Supercell API key. Do not add this key to Vercel or commit it.
4. Keep `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` configured for local development.
5. Apply the updated user-role enum/schema to Neon once:

   ```powershell
   npm run db:push
   ```

6. Start the local app and sign in with the configured administrator account.
7. Add each clan from the local Clans page. The deployed production site intentionally does not call Supercell to add clans.

## Run the sync

From the repository root:

```powershell
npm run sync:clans
```

The script reads all active clan tags from Neon and, for each clan:

- Fetches the latest clan profile and current member roster.
- Inserts new players and updates profiles for players currently in a saved clan.
- Creates or reactivates clan memberships for current members.
- Marks players who have left as inactive members without deleting their player profile or saved war history.
- Fetches the current/recent war and upserts available participant and attack details.

Run it periodically while wars are active and once a war ends to capture the final result. Re-running the script updates existing records instead of intentionally creating duplicate wars, participants, or attacks.

## Data/API limitation

Supercell's public clan war log contains clan-level results, not individual player attack records. Individual attack details are available from the current/recent war response only. The script cannot reconstruct player attacks from historical wars that were never captured. Run the script during each war and again after it ends.

## Account permissions

- The first administrator is bootstrapped using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Public signups create `viewer` accounts.
- Viewers can browse saved clans, players, and wars, but cannot use write APIs.
- Only administrators can add clans from the local app or remove a member from a clan. Removing a membership preserves the player profile and war history.
