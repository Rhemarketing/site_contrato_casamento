import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password service", () => {
  it("gera hash Argon2id e verifica somente a senha correta", async () => {
    const password = "senha-longa-de-teste";
    const passwordHash = await hashPassword(password);
    expect(passwordHash).not.toBe(password);
    expect(passwordHash).toMatch(/^\$argon2id\$/);
    await expect(verifyPassword(password, passwordHash)).resolves.toBe(true);
    await expect(verifyPassword("senha-incorreta", passwordHash)).resolves.toBe(false);
  });
});
