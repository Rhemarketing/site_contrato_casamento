import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { ContractError } from "../domain/engine";

export function contractDataKey() {
  const encoded = process.env.CONTRACT_DATA_KEY;
  if (!encoded || !/^[A-Za-z0-9+/]{43}=$/.test(encoded)) throw new ContractError("KEY_UNAVAILABLE");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new ContractError("KEY_UNAVAILABLE");
  return key;
}
export function seal(value: unknown, scope: string, key = contractDataKey()) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(scope));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64"), cipher.getAuthTag().toString("base64"), ciphertext.toString("base64")].join(".");
}
export function unseal<T>(value: string, scope: string, key = contractDataKey()): T {
  try {
    const [version, iv, tag, payload] = value.split(".");
    if (version !== "v1") throw new Error();
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
