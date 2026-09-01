import { createHash, randomBytes } from "node:crypto";

export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 60;
const PASSWORD_RESET_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function generatePasswordResetToken() {
  return randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function validatePasswordResetTokenFormat(token: string) {
  return PASSWORD_RESET_TOKEN_PATTERN.test(token);
}

export function getPasswordResetExpiration(now: Date) {
  return new Date(now.getTime() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60_000);
}
