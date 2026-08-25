import { describe, expect, it } from "vitest";
import { registrationSchema } from "./auth";

const valid = { name: "Pessoa Teste", email: "pessoa@example.test", password: "uma-senha-segura", passwordConfirmation: "uma-senha-segura" };

describe("registrationSchema", () => {
  it("aceita dados válidos", () => expect(registrationSchema.safeParse(valid).success).toBe(true));
  it("recusa e-mail inválido", () => expect(registrationSchema.safeParse({ ...valid, email: "invalido" }).success).toBe(false));
  it("recusa senha curta", () => expect(registrationSchema.safeParse({ ...valid, password: "curta", passwordConfirmation: "curta" }).success).toBe(false));
  it("recusa confirmação diferente", () => expect(registrationSchema.safeParse({ ...valid, passwordConfirmation: "outra-senha-segura" }).success).toBe(false));
  it("recusa nome vazio", () => expect(registrationSchema.safeParse({ ...valid, name: "  " }).success).toBe(false));
});
