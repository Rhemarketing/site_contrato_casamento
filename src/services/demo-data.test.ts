// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { admissionQuestionnaireV8 } from "@/data/questionnaire-admission-v8";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import {
  assertSafeDemoEnvironment,
  DEMO_EMAIL_DOMAIN,
  DEMO_USERS,
  resetDemoData,
  seedDemoData,
} from "./demo-data.service";
import { syncQuestionnaire } from "./questionnaire-seed.service";

const prisma = createTestPrismaClient();
const realEmail = `real-${Date.now()}@example.test`;

describe("dados locais de demonstração", () => {
  beforeAll(async () => {
    await syncQuestionnaire(prisma, admissionQuestionnaireV8);
    await resetDemoData(prisma);
    await prisma.user.create({ data: { email: realEmail, name: "Usuário Real" } });
  });

  afterAll(async () => {
    await resetDemoData(prisma);
    await prisma.user.deleteMany({ where: { email: realEmail } });
    await prisma.$disconnect();
  });

  it("recusa produção e bancos remotos ou não autorizados", () => {
    expect(() => assertSafeDemoEnvironment({ nodeEnv: "production", databaseUrl: "mysql://user:pass@127.0.0.1/contrato_casamento" })).toThrow("DEMO_SEED_FORBIDDEN_IN_PRODUCTION");
    expect(() => assertSafeDemoEnvironment({ nodeEnv: "development", databaseUrl: "mysql://user:pass@db.example.com/contrato_casamento" })).toThrow("DEMO_REMOTE_DATABASE_FORBIDDEN");
    expect(() => assertSafeDemoEnvironment({ nodeEnv: "development", databaseUrl: "mysql://user:pass@127.0.0.1/outro_banco" })).toThrow("DEMO_REMOTE_DATABASE_FORBIDDEN");
    expect(() => assertSafeDemoEnvironment({ nodeEnv: "test", databaseUrl: "mysql://user:pass@127.0.0.1/contrato_casamento_test" })).not.toThrow();
  });

  it("cria todos os cenários esperados", async () => {
    const result = await seedDemoData(prisma, "senha-demo-segura-123");
    expect(result).toEqual({ users: 9, couples: 2, attempts: 7 });
    expect(await prisma.user.count({ where: { email: { endsWith: DEMO_EMAIL_DOMAIN } } })).toBe(DEMO_USERS.length);
    expect(await prisma.questionnaireAttempt.count({ where: { user: { email: { endsWith: DEMO_EMAIL_DOMAIN } } } })).toBe(7);
    expect(await prisma.couple.count({ where: { members: { some: { user: { email: { endsWith: DEMO_EMAIL_DOMAIN } } } } } })).toBe(2);

    const andamento = await prisma.user.findUniqueOrThrow({ where: { email: "demo.andamento@contrato.local" }, include: { attempts: { include: { _count: { select: { answers: true } } } } } });
    expect(andamento.attempts[0]).toMatchObject({ status: "IN_PROGRESS", _count: { answers: 15 } });
    const base = await prisma.user.findUniqueOrThrow({ where: { email: "demo.base@contrato.local" }, include: { attempts: true } });
    const desgaste = await prisma.user.findUniqueOrThrow({ where: { email: "demo.desgaste@contrato.local" }, include: { attempts: { include: { resultFlags: true } } } });
    expect(Number(base.attempts[0].totalScore)).toBe(0);
    expect(Number(desgaste.attempts[0].totalScore)).toBe(50);
    expect(desgaste.attempts[0].resultFlags).toHaveLength(4);
  });

  it("é idempotente e mantém um único conjunto conhecido", async () => {
    await seedDemoData(prisma, "senha-demo-segura-123");
    await seedDemoData(prisma, "senha-demo-segura-123");
    expect(await prisma.user.count({ where: { email: { endsWith: DEMO_EMAIL_DOMAIN } } })).toBe(9);
    expect(await prisma.questionnaireAttempt.count({ where: { user: { email: { endsWith: DEMO_EMAIL_DOMAIN } } } })).toBe(7);
    expect(await prisma.coupleInvite.count({ where: { createdBy: { email: { endsWith: DEMO_EMAIL_DOMAIN } } } })).toBe(1);
  });

  it("reset remove somente o domínio demo e preserva usuário real", async () => {
    const result = await resetDemoData(prisma);
    expect(result).toEqual({ removedUsers: 9, removedCouples: 2 });
    expect(await prisma.user.count({ where: { email: { endsWith: DEMO_EMAIL_DOMAIN } } })).toBe(0);
    expect(await prisma.user.findUnique({ where: { email: realEmail } })).not.toBeNull();
  });
});
