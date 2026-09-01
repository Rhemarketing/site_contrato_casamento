// @vitest-environment node

import { createHash } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { hashPasswordResetToken } from "@/lib/password-reset-token";
import { hashPassword, verifyPassword } from "@/lib/password";
import { PrismaPasswordResetRepository } from "@/repositories/prisma/prisma-password-reset.repository";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import { EmailService, type EmailMessage, type EmailTransport } from "./email.service";
import { PASSWORD_RESET_PUBLIC_MESSAGE, PasswordResetService } from "./password-reset.service";

class RecordingTransport implements EmailTransport {
  readonly messages: EmailMessage[] = [];
  constructor(private readonly shouldFail = false) {}
  async send(message: EmailMessage) {
    if (this.shouldFail) throw new Error("provider details must stay internal");
    this.messages.push(message);
  }
}

const prisma = createTestPrismaClient();
const repository = new PrismaPasswordResetRepository(prisma);
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const userIds: string[] = [];
const now = new Date("2026-08-28T12:00:00.000Z");

function tokenFor(label: string) {
  return createHash("sha256").update(`${label}-${suffix}`).digest("base64url");
}

async function createUser(label: string) {
  const user = await prisma.user.create({
    data: {
      name: `Reset ${label}`,
      email: `reset-${label}-${suffix}@example.test`,
      passwordHash: await hashPassword("senha-antiga-segura"),
    },
  });
  userIds.push(user.id);
  return user;
}

function serviceWith(token: string, transport = new RecordingTransport()) {
  return {
    service: new PasswordResetService(repository, new EmailService(transport), {
      now: () => now,
      generateToken: () => token,
      appUrl: "https://casamento.example.test",
    }),
    transport,
  };
}

describe("recuperação segura de senha", () => {
  afterAll(async () => {
    await prisma.passwordResetToken.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  });

  it("retorna a mesma resposta pública para e-mail existente e inexistente", async () => {
    const user = await createUser("enumeration");
    const existing = serviceWith(tokenFor("enumeration-existing"));
    const missing = serviceWith(tokenFor("enumeration-missing"));
    expect(await existing.service.request({ email: user.email })).toEqual({ message: PASSWORD_RESET_PUBLIC_MESSAGE });
    expect(await missing.service.request({ email: `missing-${suffix}@example.test` })).toEqual({ message: PASSWORD_RESET_PUBLIC_MESSAGE });
    expect(existing.transport.messages).toHaveLength(1);
    expect(missing.transport.messages).toHaveLength(0);
  });

  it("normaliza trim e lowercase antes de localizar a conta", async () => {
    const user = await createUser("normalize");
    const fixture = serviceWith(tokenFor("normalize"));
    await fixture.service.request({ email: `  ${user.email.toUpperCase()}  ` });
    expect(fixture.transport.messages[0].to).toBe(user.email);
  });

  it("persiste somente SHA-256 e envia URL baseada em APP_URL com expiração de 60 minutos", async () => {
    const user = await createUser("hash-only");
    const rawToken = tokenFor("hash-only");
    const fixture = serviceWith(rawToken);
    const response = await fixture.service.request({ email: user.email });
    const stored = await prisma.passwordResetToken.findUniqueOrThrow({
      where: { tokenHash: hashPasswordResetToken(rawToken) },
    });
    expect(stored.tokenHash).toBe(hashPasswordResetToken(rawToken));
    expect(JSON.stringify(stored)).not.toContain(rawToken);
    expect(stored.expiresAt.toISOString()).toBe("2026-08-28T13:00:00.000Z");
    expect(fixture.transport.messages[0].text).toContain(`https://casamento.example.test/redefinir-senha/${rawToken}`);
    expect(JSON.stringify(response)).not.toContain(rawToken);
  });

  it("distingue token inválido, expirado e já utilizado sem retornar dados pessoais", async () => {
    const user = await createUser("states");
    const rawToken = tokenFor("states");
    const fixture = serviceWith(rawToken);
    await fixture.service.request({ email: user.email });
    const beforePreview = await prisma.passwordResetToken.findUniqueOrThrow({ where: { tokenHash: hashPasswordResetToken(rawToken) } });
    expect(await fixture.service.preview(rawToken)).toBe("VALID");
    expect(await prisma.passwordResetToken.findUniqueOrThrow({ where: { tokenHash: hashPasswordResetToken(rawToken) } })).toEqual(beforePreview);
    expect(await fixture.service.preview("token-malformado")).toBe("INVALID");
    await prisma.passwordResetToken.update({
      where: { tokenHash: hashPasswordResetToken(rawToken) },
      data: { expiresAt: new Date(now.getTime() - 1) },
    });
    expect(await fixture.service.preview(rawToken)).toBe("EXPIRED");
    await prisma.passwordResetToken.update({
      where: { tokenHash: hashPasswordResetToken(rawToken) },
      data: { usedAt: now },
    });
    expect(await fixture.service.preview(rawToken)).toBe("USED");
  });

  it("redefine com Argon2id, consome uma vez e altera somente o owner do token", async () => {
    const owner = await createUser("owner");
    const outsider = await createUser("outsider");
    const outsiderBefore = await prisma.user.findUniqueOrThrow({ where: { id: outsider.id } });
    const rawToken = tokenFor("owner");
    const otherOwnerToken = tokenFor("owner-other-pending");
    const fixture = serviceWith(rawToken);
    await fixture.service.request({ email: owner.email });
    await prisma.passwordResetToken.create({
      data: {
        userId: owner.id,
        tokenHash: hashPasswordResetToken(otherOwnerToken),
        expiresAt: new Date(now.getTime() + 60_000),
      },
    });
    expect(await fixture.service.reset({
      token: rawToken,
      password: "nova-senha-muito-segura",
      passwordConfirmation: "nova-senha-muito-segura",
    })).toBe("SUCCESS");
    const changed = await prisma.user.findUniqueOrThrow({ where: { id: owner.id } });
    const unchanged = await prisma.user.findUniqueOrThrow({ where: { id: outsider.id } });
    expect(changed.passwordHash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword("nova-senha-muito-segura", changed.passwordHash!)).toBe(true);
    expect(unchanged.passwordHash).toBe(outsiderBefore.passwordHash);
    expect(await fixture.service.preview(rawToken)).toBe("USED");
    expect(await fixture.service.preview(otherOwnerToken)).toBe("USED");
  });

  it("uma nova solicitação invalida tokens pendentes anteriores", async () => {
    const user = await createUser("replace");
    const firstToken = tokenFor("replace-first");
    const secondToken = tokenFor("replace-second");
    await serviceWith(firstToken).service.request({ email: user.email });
    await serviceWith(secondToken).service.request({ email: user.email });
    expect(await serviceWith(firstToken).service.preview(firstToken)).toBe("USED");
    expect(await serviceWith(secondToken).service.preview(secondToken)).toBe("VALID");
  });

  it("duplo uso concorrente permite exatamente uma troca de senha", async () => {
    const user = await createUser("concurrent");
    const rawToken = tokenFor("concurrent");
    const fixture = serviceWith(rawToken);
    await fixture.service.request({ email: user.email });
    const input = {
      token: rawToken,
      password: "senha-concorrente-segura",
      passwordConfirmation: "senha-concorrente-segura",
    };
    const results = await Promise.all([fixture.service.reset(input), fixture.service.reset(input)]);
    expect(results.filter((result) => result === "SUCCESS")).toHaveLength(1);
    expect(results.filter((result) => result === "USED")).toHaveLength(1);
  });

  it("falha do provider é controlada sem apagar ou expor o token", async () => {
    const user = await createUser("provider-failure");
    const rawToken = tokenFor("provider-failure");
    const fixture = serviceWith(rawToken, new RecordingTransport(true));
    expect(await fixture.service.request({ email: user.email })).toEqual({ message: PASSWORD_RESET_PUBLIC_MESSAGE });
    expect(await fixture.service.preview(rawToken)).toBe("VALID");
  });
});
