// @vitest-environment node
import { randomBytes } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import { contentHash, seal, unseal } from "./privacy";
import { previewAvailable, requireContractPreview } from "./access";

afterEach(() => vi.unstubAllEnvs());
it("criptografa respostas, vincula ao dono/sessão e rejeita adulteração", () => {
  const key = randomBytes(32);
  const encrypted = seal({ privateAnswer: "conteúdo sensível" }, "session:owner", key);
  expect(encrypted).not.toContain("sensível");
  expect(unseal(encrypted, "session:owner", key)).toEqual({ privateAnswer: "conteúdo sensível" });
  expect(() => unseal(encrypted, "session:partner", key)).toThrow();
  expect(() => unseal(encrypted, "session:owner", randomBytes(32))).toThrow();
  const parts = encrypted.split("."); parts[3] = Buffer.from("tampered").toString("base64");
  expect(() => unseal(parts.join("."), "session:owner", key)).toThrow();
  expect(contentHash({ b: 2, a: 1 })).toBe(contentHash({ a: 1, b: 2 }));
});
it("bloqueia produção, banco remoto e contas fora da lista mesmo com flag habilitada", () => {
  vi.stubEnv("CONTRACT_PREVIEW_ENABLED", "true"); vi.stubEnv("CONTRACT_PREVIEW_USER_IDS", "test-user");
  vi.stubEnv("CONTRACT_DATA_KEY", randomBytes(32).toString("base64"));
  vi.stubEnv("DATABASE_URL", "mysql://local@localhost/contract_test"); vi.stubEnv("NODE_ENV", "development");
  expect(previewAvailable()).toBe(true); expect(() => requireContractPreview("outsider")).toThrow();
  expect(() => requireContractPreview("test-user")).not.toThrow();
  vi.stubEnv("NODE_ENV", "production"); expect(previewAvailable()).toBe(false);
  vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("DATABASE_URL", "mysql://user@remote.example/database"); expect(previewAvailable()).toBe(false);
});
it("rotaciona gravações sem perder leitura antiga e vincula cada envelope à chave correta", () => {
  const previous = randomBytes(32).toString("base64"), current = randomBytes(32).toString("base64");
  vi.stubEnv("CONTRACT_DATA_KEY", previous);
  const legacy = seal({ own: "antigo" }, "owner");
  vi.stubEnv("CONTRACT_DATA_KEYS", JSON.stringify({ current }));
  vi.stubEnv("CONTRACT_DATA_ACTIVE_KEY_ID", "current");
  const rotated = seal(unseal(legacy, "owner"), "owner");
  expect(rotated).toMatch(/^v2.current\./);
  expect(unseal(rotated, "owner")).toEqual({ own: "antigo" });
  expect(unseal(legacy, "owner")).toEqual({ own: "antigo" });
  expect(() => unseal(rotated.replace("v2.current.", "v2.unknown."), "owner")).toThrow();
  expect(() => unseal(rotated, "partner")).toThrow();
});
