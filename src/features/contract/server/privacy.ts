import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { ContractError } from "../domain/engine";

function decodeKey(encoded: string | undefined) {
  if (!encoded || !/^[A-Za-z0-9+/]{43}=$/.test(encoded)) throw new ContractError("KEY_UNAVAILABLE");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new ContractError("KEY_UNAVAILABLE");
  return key;
}
function keyring() {
  if (!process.env.CONTRACT_DATA_KEYS) return null;
  try {
    const keys = JSON.parse(process.env.CONTRACT_DATA_KEYS) as Record<string, string>;
    const active = process.env.CONTRACT_DATA_ACTIVE_KEY_ID;
    if (!active || !/^[a-zA-Z0-9_-]{1,40}$/.test(active) || !Object.hasOwn(keys, active)) throw new Error();
    return { active, keys };
  } catch { throw new ContractError("KEY_UNAVAILABLE"); }
}
export function contractDataKey() {
  const ring = keyring();
  return decodeKey(ring ? ring.keys[ring.active] : process.env.CONTRACT_DATA_KEY);
}
export function seal(value: unknown, scope: string, explicitKey?: Buffer) {
  const ring = explicitKey ? null : keyring();
  const key = explicitKey ?? contractDataKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(scope));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return [...(ring ? ["v2", ring.active] : ["v1"]), iv.toString("base64"), cipher.getAuthTag().toString("base64"), ciphertext.toString("base64")].join(".");
}
export function unseal<T>(value: string, scope: string, explicitKey?: Buffer): T {
  try {
    const parts = value.split(".");
    const version = parts.shift();
    const keyId = version === "v2" ? parts.shift() : null;
    if (!["v1", "v2"].includes(version ?? "") || parts.length !== 3) throw new Error();
    const ring = keyId ? keyring() : null;
    const key = explicitKey ?? decodeKey(keyId ? ring?.keys[keyId] : process.env.CONTRACT_DATA_KEY);
    const [iv, tag, payload] = parts;
    if (Buffer.from(iv, "base64").length !== 12 || Buffer.from(tag, "base64").length !== 16) throw new Error();
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
    decipher.setAAD(Buffer.from(scope));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return JSON.parse(Buffer.concat([decipher.update(Buffer.from(payload, "base64")), decipher.final()]).toString("utf8")) as T;
  } catch { throw new ContractError("PRIVATE_DATA_UNAVAILABLE"); }
}
export function contentHash(value: unknown): string {
  const canonical = (v: unknown): unknown => Array.isArray(v) ? v.map(canonical) : v && typeof v === "object"
    ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, item]) => [k, canonical(item)])) : v;
  return createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
}
export function proposalHash(content: unknown, revision: number, basisHash: string) {
  return contentHash({ content, revision, basisHash });
}
