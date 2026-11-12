import { describe, it, expect } from "vitest";
import {
  clanSchema,
  playerSchema,
  warAttackSchema,
  warSchema,
} from "../lib/validations";

describe("clanSchema", () => {
  it("validates a valid clan", () => {
    const result = clanSchema.safeParse({
      name: "Test Clan",
      tag: "#TEST123",
      clanLevel: 5,
      warLeague: "gold",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tag).toBe("#TEST123");
    }
  });

  it("rejects empty name", () => {
    const result = clanSchema.safeParse({
      name: "",
      tag: "#TEST123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing tag", () => {
    const result = clanSchema.safeParse({
      name: "Test Clan",
    });
    expect(result.success).toBe(false);
  });

  it("rejects clan level above 20", () => {
    const result = clanSchema.safeParse({
      name: "Test Clan",
      tag: "#TEST123",
      clanLevel: 21,
    });
    expect(result.success).toBe(false);
  });
});

describe("playerSchema", () => {
  it("validates a valid player", () => {
    const result = playerSchema.safeParse({
      playerTag: "#PLAYER1",
      name: "Test Player",
      townHallLevel: 15,
      role: "co_leader",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty player tag", () => {
    const result = playerSchema.safeParse({
      playerTag: "",
      name: "Test Player",
    });
    expect(result.success).toBe(false);
  });

  it("rejects town hall level above 17", () => {
    const result = playerSchema.safeParse({
      playerTag: "#PLAYER1",
      name: "Test Player",
      townHallLevel: 18,
    });
    expect(result.success).toBe(false);
  });
});

describe("warAttackSchema", () => {
  it("validates a valid attack", () => {
    const result = warAttackSchema.safeParse({
      warId: "550e8400-e29b-41d4-a716-446655440000",
      participantId: "550e8400-e29b-41d4-a716-446655440001",
      defenderPosition: "A1",
      attackNumber: 1,
      stars: 3,
      destruction: 100,
    });
    expect(result.success).toBe(true);
  });

  it("rejects stars above 3", () => {
    const result = warAttackSchema.safeParse({
      warId: "550e8400-e29b-41d4-a716-446655440000",
      participantId: "550e8400-e29b-41d4-a716-446655440001",
      defenderPosition: "A1",
      attackNumber: 1,
      stars: 4,
      destruction: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects destruction above 100", () => {
    const result = warAttackSchema.safeParse({
      warId: "550e8400-e29b-41d4-a716-446655440000",
      participantId: "550e8400-e29b-41d4-a716-446655440001",
      defenderPosition: "A1",
      attackNumber: 1,
      stars: 1,
      destruction: 101,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative stars", () => {
    const result = warAttackSchema.safeParse({
      warId: "550e8400-e29b-41d4-a716-446655440000",
      participantId: "550e8400-e29b-41d4-a716-446655440001",
      defenderPosition: "A1",
      attackNumber: 1,
      stars: -1,
      destruction: 50,
    });
    expect(result.success).toBe(false);
  });
});

describe("warSchema", () => {
  it("validates a valid war", () => {
    const result = warSchema.safeParse({
      clanId: "550e8400-e29b-41d4-a716-446655440000",
      opponentName: "Enemy Clan",
      warType: "normal",
      warSize: 50,
      maxAttacksPerPlayer: 2,
      startAt: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing opponent name", () => {
    const result = warSchema.safeParse({
      clanId: "550e8400-e29b-41d4-a716-446655440000",
      opponentName: "",
      startAt: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });
});