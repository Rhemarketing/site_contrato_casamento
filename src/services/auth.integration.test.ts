// @vitest-environment node

import { afterAll, describe, expect, it } from "vitest";
import { authenticateCredentials, EmailAlreadyRegisteredError, registerUser } from "./auth.service";
import { createTestPrismaClient } from "@/test/create-test-prisma";

const prisma = createTestPrismaClient();
const repository = {
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  create: (data: { name: string; email: string; passwordHash: string }) => prisma.user.create({ data: { ...data, role: "USER" } }),
};
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const email = ` Auth-${suffix}@EXAMPLE.test `;
const normalizedEmail = email.trim().toLowerCase();
const password = "senha-segura-integracao";

describe("authentication integration", () => {
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [normalizedEmail, `role-${normalizedEmail}`] } } });
    await prisma.$disconnect();
  });

  it("cadastra usuário normalizado, com hash e role USER", async () => {
    const user = await registerUser({ name: "Pessoa Integração", email, password, passwordConfirmation: password }, repository);
    const persisted = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(persisted.email).toBe(normalizedEmail);
    expect(persisted.passwordHash).toBeTruthy();
    expect(persisted.passwordHash).not.toContain(password);
    expect(persisted.role).toBe("USER");
  });

  it("recusa cadastro duplicado", async () => {
    await expect(registerUser({ name: "Duplicado", email, password, passwordConfirmation: password }, repository)).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
  });

  it("ignora tentativa de definir role ADMIN e cria USER", async () => {
    const injectedEmail = `role-${normalizedEmail}`;
    const user = await registerUser({ name: "Role Test", email: injectedEmail, password, passwordConfirmation: password, role: "ADMIN" }, repository);
    expect(user.role).toBe("USER");
    expect((await prisma.user.findUniqueOrThrow({ where: { email: injectedEmail } })).role).toBe("USER");
  });

  it("autentica somente credenciais corretas sem expor passwordHash", async () => {
    const valid = await authenticateCredentials({
      email: email.toUpperCase(),
      password,
      callbackUrl: "/dashboard",
    }, repository);
    expect(valid?.id).toBeTruthy();
    expect(valid).not.toHaveProperty("passwordHash");
    await expect(authenticateCredentials({ email, password: "senha-incorreta" }, repository)).resolves.toBeNull();
    await expect(authenticateCredentials({ email: `missing-${suffix}@example.test`, password }, repository)).resolves.toBeNull();
  });
});
