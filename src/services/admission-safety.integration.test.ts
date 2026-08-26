// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMISSION_QUESTIONNAIRE_CODE, ADMISSION_QUESTIONNAIRE_VERSION } from "@/config/admission-questionnaire";
import { admissionQuestionnaireV8 } from "@/data/questionnaire-admission-v8";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import { syncQuestionnaire } from "./questionnaire-seed.service";
import { AdmissionResultService } from "./admission-result.service";
import { AdmissionSafetyService } from "./admission-safety.service";

const prisma = createTestPrismaClient();
const safetyService = new AdmissionSafetyService(prisma);
const resultService = new AdmissionResultService(prisma);
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const userIds: string[] = [];
const coupleIds: string[] = [];
let questionnaire: Awaited<ReturnType<typeof loadQuestionnaire>>;

function loadQuestionnaire() {
  return prisma.questionnaire.findUniqueOrThrow({
    where: { code_version: { code: ADMISSION_QUESTIONNAIRE_CODE, version: ADMISSION_QUESTIONNAIRE_VERSION } },
    include: { questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } } },
  });
}

async function createUser(label: string, role: "USER" | "ADMIN" = "USER") {
  const user = await prisma.user.create({ data: { name: `Safety ${label}`, email: `safety-${label}-${suffix}@example.test`, role } });
  userIds.push(user.id);
  return user;
}

async function createCompletedAttempt(label: string, safetyLetters: ["A" | "B" | "C", "A" | "B" | "C", "A" | "B" | "C"]) {
  const user = await createUser(label);
  const attempt = await prisma.questionnaireAttempt.create({
    data: {
      questionnaireId: questionnaire.id,
      questionnaireVersion: questionnaire.version,
      userId: user.id,
      status: "IN_PROGRESS",
      openAttemptKey: `${user.id}:${questionnaire.id}`,
    },
  });
  await prisma.answer.createMany({
    data: questionnaire.questions.map((question) => {
      const letter = question.order >= 6 && question.order <= 30
        ? "B"
        : question.order >= 31 && question.order <= 33
          ? safetyLetters[question.order - 31]
          : "A";
      const option = question.options.find((candidate) => candidate.letter === letter)!;
      return { attemptId: attempt.id, questionId: question.id, optionId: option.id, score: option.score };
    }),
  });
  await resultService.completeForUser(user.id, attempt.id);
  return { user, attempt };
}

describe("acesso privado e compartilhável das respostas P31-P33", () => {
  beforeAll(async () => {
    await syncQuestionnaire(prisma, admissionQuestionnaireV8);
    questionnaire = await loadQuestionnaire();
  });

  afterAll(async () => {
    const attempts = await prisma.questionnaireAttempt.findMany({ where: { userId: { in: userIds } }, select: { id: true } });
    const attemptIds = attempts.map(({ id }) => id);
    await prisma.answer.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.areaResult.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.resultFlag.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.questionnaireAttempt.deleteMany({ where: { id: { in: attemptIds } } });
    await prisma.coupleMember.deleteMany({ where: { coupleId: { in: coupleIds } } });
    await prisma.couple.deleteMany({ where: { id: { in: coupleIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  });

  it.each([
    [["A", "A", "A"], "NONE"],
    [["B", "A", "A"], "ATTENTION"],
    [["A", "A", "C"], "ALERT"],
    [["A", "C", "A"], "HIGH_ALERT"],
  ] as const)("deriva o nível privado %s somente para o owner", async (letters, expected) => {
    const { user, attempt } = await createCompletedAttempt(`level-${expected}`, [...letters]);
    const result = await safetyService.getPrivateSafetyResultForUser(user.id, attempt.id);
    expect(result.overallLevel).toBe(expected);
    expect(result.items.map(({ questionCode }) => questionCode)).toEqual(["P31", "P32", "P33"]);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/SAFETY_|CONSENT_|answerId|optionId|passwordHash|partner|financial|score/i);
  });

  it("nega estranho mesmo conhecendo attemptId, questionId e answerId", async () => {
    const owner = await createCompletedAttempt("stranger-owner", ["A", "C", "A"]);
    const stranger = await createUser("stranger");
    const privateAnswer = await prisma.answer.findFirstOrThrow({ where: { attemptId: owner.attempt.id, question: { code: "P32" } } });
    expect(privateAnswer.id).toBeTruthy();
    expect(privateAnswer.questionId).toBeTruthy();
    await expect(safetyService.getPrivateSafetyResultForUser(stranger.id, owner.attempt.id)).rejects.toMatchObject({ code: "PRIVATE_RESULT_FORBIDDEN" });
  });

  it("nega ao parceiro legítimo do mesmo casal", async () => {
    const owner = await createCompletedAttempt("partner-owner", ["A", "C", "A"]);
    const partner = await createUser("partner");
    const couple = await prisma.couple.create({ data: { status: "ACTIVE" } });
    coupleIds.push(couple.id);
    await prisma.coupleMember.createMany({ data: [
      { coupleId: couple.id, userId: owner.user.id, role: "CREATOR" },
      { coupleId: couple.id, userId: partner.id, role: "PARTNER" },
    ] });
    await prisma.questionnaireAttempt.update({ where: { id: owner.attempt.id }, data: { coupleId: couple.id } });
    await expect(safetyService.getPrivateSafetyResultForUser(partner.id, owner.attempt.id)).rejects.toMatchObject({ code: "PRIVATE_RESULT_FORBIDDEN" });
  });

  it("nega ADMIN sem bypass", async () => {
    const owner = await createCompletedAttempt("admin-owner", ["A", "A", "C"]);
    const admin = await createUser("admin", "ADMIN");
    await expect(safetyService.getPrivateSafetyResultForUser(admin.id, owner.attempt.id)).rejects.toMatchObject({ code: "PRIVATE_RESULT_FORBIDDEN" });
  });

  it("DTO compartilhável exclui completamente P31-P33 e códigos internos", async () => {
    const owner = await createCompletedAttempt("shareable", ["C", "C", "C"]);
    const shareable = await safetyService.getShareableAnswersForOwner(owner.user.id, owner.attempt.id);
    expect(shareable).toHaveLength(37);
    expect(shareable.map(({ questionCode }) => questionCode)).toContain("P30");
    expect(shareable.map(({ questionCode }) => questionCode)).toContain("P34");
    const serialized = JSON.stringify(shareable);
    expect(serialized).not.toMatch(/P31|P32|P33|SAFETY_|CONSENT_|answerId|optionId|privateAnswersHidden|hasSafetyAlert|safetyDataAvailable/);
  });

  it("alterar P31-P33 não muda score, áreas, counts ou ResultFlag", async () => {
    const allA = await createCompletedAttempt("neutral-a", ["A", "A", "A"]);
    const allC = await createCompletedAttempt("neutral-c", ["C", "C", "C"]);
    const [resultA, resultC, areasA, areasC, flagsA, flagsC] = await Promise.all([
      resultService.getAdmissionResultForUser(allA.user.id, allA.attempt.id),
      resultService.getAdmissionResultForUser(allC.user.id, allC.attempt.id),
      prisma.areaResult.findMany({ where: { attemptId: allA.attempt.id }, orderBy: { area: "asc" }, select: { area: true, score: true, maxScore: true, averageScore: true, classification: true } }),
      prisma.areaResult.findMany({ where: { attemptId: allC.attempt.id }, orderBy: { area: "asc" }, select: { area: true, score: true, maxScore: true, averageScore: true, classification: true } }),
      prisma.resultFlag.findMany({ where: { attemptId: allA.attempt.id }, select: { code: true } }),
      prisma.resultFlag.findMany({ where: { attemptId: allC.attempt.id }, select: { code: true } }),
    ]);
    expect(resultC).toEqual(resultA);
    expect(areasC).toEqual(areasA);
    expect(flagsC).toEqual(flagsA);
    expect(flagsC).toEqual([]);
  });

  it("recusa configuração privada com score numérico", async () => {
    const owner = await createCompletedAttempt("bad-score", ["A", "A", "A"]);
    const p31 = questionnaire.questions[30];
    await prisma.answer.update({ where: { attemptId_questionId: { attemptId: owner.attempt.id, questionId: p31.id } }, data: { score: 1 } });
    await expect(safetyService.getPrivateSafetyResultForUser(owner.user.id, owner.attempt.id)).rejects.toMatchObject({ code: "PRIVATE_SAFETY_CONFIGURATION_ERROR" });
  });
});
