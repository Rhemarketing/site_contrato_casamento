// @vitest-environment node

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

function createTestClient() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) throw new Error("DATABASE_URL de teste não configurada.");

  const url = new URL(rawUrl);
  const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
  if (!["127.0.0.1", "localhost"].includes(url.hostname) || !database.endsWith("_test")) {
    throw new Error("Os testes de integração só podem usar um banco local terminado em _test.");
  }

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    connectionLimit: 2,
  });

  return new PrismaClient({ adapter });
}

const prisma = createTestClient();
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

let userId: string;
let questionnaireId: string;
let questionId: string;
let optionId: string;
let coupleId: string;
let attemptId: string;

async function expectUniqueViolation(operation: Promise<unknown>) {
  await expect(operation).rejects.toMatchObject({ code: "P2002" });
}

describe("database domain constraints", () => {
  beforeAll(async () => {
    const user = await prisma.user.create({ data: { email: `base-${suffix}@example.test`, name: "Base User" } });
    userId = user.id;

    const questionnaire = await prisma.questionnaire.create({
      data: { code: `ADMISSION_${suffix}`, name: "Admission", version: "8.0" },
    });
    questionnaireId = questionnaire.id;

    const question = await prisma.question.create({
      data: {
        questionnaireId,
        code: "P01",
        order: 1,
        stage: "ADMISSION",
        area: "VALUES",
        text: "Integration test question",
      },
    });
    questionId = question.id;

    const option = await prisma.questionOption.create({
      data: { questionId, letter: "A", text: "Option A", score: "1.00", order: 1 },
    });
    optionId = option.id;

    const couple = await prisma.couple.create({ data: {} });
    coupleId = couple.id;

    const attempt = await prisma.questionnaireAttempt.create({
      data: { questionnaireId, questionnaireVersion: "8.0", userId, coupleId },
    });
    attemptId = attempt.id;
  });

  afterAll(async () => {
    if (attemptId) {
      await prisma.answer.deleteMany({ where: { attemptId } });
      await prisma.areaResult.deleteMany({ where: { attemptId } });
      await prisma.resultFlag.deleteMany({ where: { attemptId } });
      await prisma.questionnaireAttempt.deleteMany({ where: { id: attemptId } });
    }
    if (coupleId) {
      await prisma.coupleInvite.deleteMany({ where: { coupleId } });
      await prisma.coupleMember.deleteMany({ where: { coupleId } });
      await prisma.couple.deleteMany({ where: { id: coupleId } });
    }
    if (questionnaireId) {
      await prisma.questionOption.deleteMany({ where: { question: { questionnaireId } } });
      await prisma.question.deleteMany({ where: { questionnaireId } });
      await prisma.questionnaire.deleteMany({ where: { id: questionnaireId } });
    }
    if (userId) await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("enforces unique User.email", async () => {
    await expectUniqueViolation(prisma.user.create({ data: { email: `base-${suffix}@example.test`, name: "Duplicate" } }));
  });

  it("enforces unique Questionnaire code and version", async () => {
    await expectUniqueViolation(prisma.questionnaire.create({ data: { code: `ADMISSION_${suffix}`, name: "Duplicate", version: "8.0" } }));
  });

  it("enforces unique Question questionnaireId and code", async () => {
    await expectUniqueViolation(prisma.question.create({ data: { questionnaireId, code: "P01", order: 2, stage: "ADMISSION", area: "VALUES", text: "Duplicate code" } }));
  });

  it("enforces unique Question questionnaireId and order", async () => {
    await expectUniqueViolation(prisma.question.create({ data: { questionnaireId, code: "P02", order: 1, stage: "ADMISSION", area: "VALUES", text: "Duplicate order" } }));
  });

  it("enforces unique QuestionOption questionId and letter", async () => {
    await expectUniqueViolation(prisma.questionOption.create({ data: { questionId, letter: "A", text: "Duplicate", order: 2 } }));
  });

  it("enforces unique CoupleMember coupleId and userId", async () => {
    await prisma.coupleMember.create({ data: { coupleId, userId, role: "CREATOR" } });
    await expectUniqueViolation(prisma.coupleMember.create({ data: { coupleId, userId, role: "PARTNER" } }));
  });

  it("enforces unique Answer attemptId and questionId", async () => {
    await prisma.answer.create({ data: { attemptId, questionId, optionId, score: "1.00" } });
    await expectUniqueViolation(prisma.answer.create({ data: { attemptId, questionId, optionId, score: "1.00" } }));
  });

  it("enforces unique AreaResult attemptId and area", async () => {
    await prisma.areaResult.create({ data: { attemptId, area: "VALUES", score: "1.00", maxScore: "2.00", averageScore: "0.50", classification: "TEST" } });
    await expectUniqueViolation(prisma.areaResult.create({ data: { attemptId, area: "VALUES", score: "2.00", maxScore: "2.00", averageScore: "1.00", classification: "DUPLICATE" } }));
  });

  it("enforces unique CoupleInvite.tokenHash", async () => {
    const tokenHash = "a".repeat(64);
    await prisma.coupleInvite.create({ data: { coupleId, createdByUserId: userId, email: `invite-${suffix}@example.test`, tokenHash, expiresAt: new Date(Date.now() + 86_400_000) } });
    await expectUniqueViolation(prisma.coupleInvite.create({ data: { coupleId, createdByUserId: userId, email: `other-${suffix}@example.test`, tokenHash, expiresAt: new Date(Date.now() + 86_400_000) } }));
  });
});
