import { describe, expect, it } from "vitest";
import { passwordResetRequestSchema, passwordResetSubmissionSchema, registrationSchema } from "./auth";

const valid = { name: "Pessoa Teste", email: "pessoa@example.test", password: "uma-senha-segura", passwordConfirmation: "uma-senha-segura" };

describe("registrationSchema", () => {
  it("aceita dados válidos", () => expect(registrationSchema.safeParse(valid).success).toBe(true));
  it("recusa e-mail inválido", () => expect(registrationSchema.safeParse({ ...valid, email: "invalido" }).success).toBe(false));
  it.each(["1", "123", "abc", "x".repeat(256)])("aceita senha com tamanho escolhido pelo usuário (%#)", (password) => {
    expect(registrationSchema.safeParse({ ...valid, password, passwordConfirmation: password }).success).toBe(true);
    expect(passwordResetSubmissionSchema.safeParse({ token: "a".repeat(43), password, passwordConfirmation: password }).success).toBe(true);
  });
  it("recusa senha vazia", () => expect(registrationSchema.safeParse({ ...valid, password: "", passwordConfirmation: "" }).success).toBe(false));
  it("recusa confirmação diferente", () => expect(registrationSchema.safeParse({ ...valid, passwordConfirmation: "outra-senha-segura" }).success).toBe(false));
  it("recusa nome vazio", () => expect(registrationSchema.safeParse({ ...valid, name: "  " }).success).toBe(false));
});

describe("password reset schemas", () => {
  it("normaliza espaços do e-mail na solicitação", () => {
    expect(passwordResetRequestSchema.parse({ email: "  Pessoa@Example.Test  " }).email).toBe("Pessoa@Example.Test");
  });

  it("exige token no formato de 32 bytes base64url", () => {
    expect(passwordResetSubmissionSchema.safeParse({
      token: "a".repeat(43),
      password: "nova-senha-segura",
      passwordConfirmation: "nova-senha-segura",
    }).success).toBe(true);
    expect(passwordResetSubmissionSchema.safeParse({
      token: "token-invalido",
      password: "nova-senha-segura",
      passwordConfirmation: "nova-senha-segura",
    }).success).toBe(false);
  });

  it("recusa senha vazia ou confirmação diferente", () => {
    expect(passwordResetSubmissionSchema.safeParse({
      token: "a".repeat(43),
      password: "",
      passwordConfirmation: "",
    }).success).toBe(false);
    expect(passwordResetSubmissionSchema.safeParse({
      token: "a".repeat(43),
      password: "nova-senha-segura",
      passwordConfirmation: "outra-senha-segura",
    }).success).toBe(false);
  });
});
