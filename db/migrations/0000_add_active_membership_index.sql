CREATE UNIQUE INDEX "one_active_membership_per_player" ON clan_memberships ("player_id") WHERE "status" = 'active' AND "left_at" IS NULL;
