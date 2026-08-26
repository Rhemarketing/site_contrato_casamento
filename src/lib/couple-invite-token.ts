import "server-only";

import { createHash, randomBytes } from "node:crypto";

export const COUPLE_INVITE_EXPIRATION_DAYS = 7;
export const COUPLE_INVITE_TOKEN_BYTES = 32;
const COUPLE_INVITE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function generateInviteToken() {
  return randomBytes(COUPLE_INVITE_TOKEN_BYTES).toString("base64url");
}

export function validateInviteTokenFormat(token: string) {
  return COUPLE_INVITE_TOKEN_PATTERN.test(token);
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function getCoupleInviteExpiration(now = new Date()) {
  return new Date(now.getTime() + COUPLE_INVITE_EXPIRATION_DAYS * 24 * 60 * 60 * 1_000);
}
