// @vitest-environment node

import { describe, expect, it } from "vitest";
import {
  COUPLE_INVITE_EXPIRATION_DAYS,
  generateInviteToken,
  getCoupleInviteExpiration,
  hashInviteToken,
  validateInviteTokenFormat,
} from "./couple-invite-token";

describe("token de convite do casal", () => {
  it("gera 256 bits em base64url com formato validável", () => {
    const token = generateInviteToken();
    expect(token).toHaveLength(43);
    expect(validateInviteTokenFormat(token)).toBe(true);
    expect(Buffer.from(token, "base64url")).toHaveLength(32);
  });

  it("gera tokens independentes", () => {
    expect(generateInviteToken()).not.toBe(generateInviteToken());
  });

  it.each(["", "a".repeat(42), "a".repeat(44), "abc+/def", "token com espaço"])(
    "recusa formato inválido %s",
    (token) => expect(validateInviteTokenFormat(token)).toBe(false),
  );

  it("produz SHA-256 hexadecimal determinístico sem permitir reconstrução", () => {
    const token = "a".repeat(43);
    expect(hashInviteToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashInviteToken(token)).toBe(hashInviteToken(token));
    expect(hashInviteToken(token)).not.toContain(token);
  });

  it("centraliza a expiração em sete dias", () => {
    const now = new Date("2026-08-26T12:00:00.000Z");
    expect(COUPLE_INVITE_EXPIRATION_DAYS).toBe(7);
    expect(getCoupleInviteExpiration(now).toISOString()).toBe("2026-09-02T12:00:00.000Z");
  });
});
