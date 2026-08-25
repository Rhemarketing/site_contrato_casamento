import { argon2id, hash, verify } from "argon2";
import type { HashOptions } from "argon2";

const options: HashOptions = { type: argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 };

export function hashPassword(password: string) {
  return hash(password, options);
}

export function verifyPassword(password: string, passwordHash: string) {
  return verify(passwordHash, password);
}
