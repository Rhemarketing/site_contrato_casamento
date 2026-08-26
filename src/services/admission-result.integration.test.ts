// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMISSION_QUESTIONNAIRE_CODE, ADMISSION_QUESTIONNAIRE_VERSION } from "@/config/admission-questionnaire";
import { ADMISSION_PRIORITY_FLAGS } from "@/features/admission/domain/admission-score-config";
import { admissionQuestionnaireV8 } from "@/data/questionnaire-admission-v8";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import { syncQuestionnaire } from "./questionnaire-seed.service";
import { AdmissionResultService } from "./admission-result.service";

const prisma = createTestPrismaClient();
const resultService = new AdmissionResultService(prisma);
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const userIds: string[] = [];
let questionnaire: Awaited<ReturnType<typeof loadQuestionnaire>>;

function loadQuestionnaire() {
  return prisma.questionnaire.findUniqueOrThrow({
    where: { code_version: { code: ADMISSION_QUESTIONNAIRE_CODE, version: ADMISSION_QUESTIONNAIRE_VERSION } },
    include: { questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } } },
  });
}

async function createUser(label: string) {
  const user = await prisma.user.create({ data: { name: `Result ${label}`, email: `result-${label}-${suffix}@example.test` } });
  userIds.push(user.id);
  return user;
}

async function createAnsweredAttempt(label: string, diagnosticLetter: "A" | "B" | "C", neutralLetter: "A" | "C" = "A", answerCount = 40) {
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
    data: questionnaire.questions.slice(0, answerCount).map((question) => {
      const isDiagnostic = question.order >= 6 && question.order <= 30;
      const letter = isDiagnostic ? diagnosticLetter : neutralLetter;
      const option = question.options.find((candidate) => candidate.letter === letter)!;
      return { attemptId: attempt.id, questionId: question.id, optionId: option.id, score: option.score };
    }),
  });
  return { user, attempt };
}

async function persistedSnapshot(attemptId: string) {
  const attempt = await prisma.questionnaireAttempt.findUniqueOrThrow({ where: { id: attemptId } });
  const areas = await prisma.areaResult.findMany({ where: { attemptId }, orderBy: { area: "asc" } });
  const flags = await prisma.resultFlag.findMany({ where: { attemptId }, orderBy: { code: "asc" } });
  return { attempt, areas, flags };
}

describe("persistência transacional do resultado de admissão", () => {
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
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  });

  it("persiste todas A com total 0, nove áreas e nenhuma flag", async () => {
    const { user, attempt } = await createAnsweredAttempt("all-a", "A");
    await resultService.completeForUser(user.id, attempt.id);
    const persisted = await persistedSnapshot(attempt.id);
    expect(persisted.attempt).toMatchObject({ status: "COMPLETED", openAttemptKey: null });
    expect(Number(persisted.attempt.totalScore)).toBe(0);
    expect(persisted.attempt.completedAt).not.toBeNull();
    expect(persisted.areas).toHaveLength(9);
    expect(persisted.flags).toHaveLength(0);
  });

  it("persiste todas B com total 25 e áreas em atenção", async () => {
    const { user, attempt } = await createAnsweredAttempt("all-b", "B");
    await resultService.completeForUser(user.id, attempt.id);
    const persisted = await persistedSnapshot(attempt.id);
    expect(Number(persisted.attempt.totalScore)).toBe(25);
    expect(persisted.areas.every((area) => area.averageScore.toFixed(2) === "1.00" && area.classification === "PONTO_DE_ATENCAO")).toBe(true);
    expect(persisted.flags).toHaveLength(0);
  });

  it("persiste todas C com total 50, nove áreas e quatro flags únicas", async () => {
    const { user, attempt } = await createAnsweredAttempt("all-c", "C");
    await resultService.completeForUser(user.id, attempt.id);
    const persisted = await persistedSnapshot(attempt.id);
    expect(Number(persisted.attempt.totalScore)).toBe(50);
    expect(persisted.areas.map(({ area }) => area).sort()).toEqual([
      "afeto_valorizacao", "autopercepcao_disposicao", "comunicacao", "confianca_fidelidade_limites",
      "conflitos_reconciliacao", "dinheiro_responsabilidades", "habitos_compulsoes", "intimidade", "tempo_conexao_futuro",
    ]);
    expect(persisted.areas.every(({ classification }) => classification === "AREA_PRIORITARIA")).toBe(true);
    expect(persisted.flags.map(({ code }) => code).sort()).toEqual(Object.values(ADMISSION_PRIORITY_FLAGS).sort());
    expect(persisted.flags.every(({ severity }) => severity === "PRIORITY")).toBe(true);

    const directAreas = new Map(persisted.areas.map((area) => [area.area, area]));
    expect(directAreas.get("comunicacao")).toMatchObject({ classification: "AREA_PRIORITARIA" });
    expect(Number(directAreas.get("comunicacao")!.score)).toBe(6);
    expect(Number(directAreas.get("comunicacao")!.maxScore)).toBe(6);
    expect(directAreas.get("comunicacao")!.averageScore.toFixed(2)).toBe("2.00");
    expect(Number(directAreas.get("intimidade")!.score)).toBe(8);
    expect(Number(directAreas.get("habitos_compulsoes")!.maxScore)).toBe(2);

    await expect(prisma.resultFlag.create({
      data: { attemptId: attempt.id, questionId: questionnaire.questions[17].id, code: ADMISSION_PRIORITY_FLAGS.P18, severity: "PRIORITY" },
    })).rejects.toMatchObject({ code: "P2002" });
  });

  it("P31-P40 permanecem neutras também com dados persistidos", async () => {
    const first = await createAnsweredAttempt("neutral-a", "B", "A");
    const second = await createAnsweredAttempt("neutral-c", "B", "C");
    await resultService.completeForUser(first.user.id, first.attempt.id);
    await resultService.completeForUser(second.user.id, second.attempt.id);
    const resultA = await resultService.getAdmissionResultForUser(first.user.id, first.attempt.id);
    const resultC = await resultService.getAdmissionResultForUser(second.user.id, second.attempt.id);
    expect(resultC).toEqual(resultA);
  });

  it("recusa snapshot de score corrompido sem persistir resultado", async () => {
    const { user, attempt } = await createAnsweredAttempt("corrupt", "B");
    await prisma.answer.update({
      where: { attemptId_questionId: { attemptId: attempt.id, questionId: questionnaire.questions[5].id } },
      data: { score: 2 },
    });
    await expect(resultService.completeForUser(user.id, attempt.id)).rejects.toMatchObject({ code: "RESULT_CONFIGURATION_ERROR" });
    const persisted = await persistedSnapshot(attempt.id);
    expect(persisted.attempt).toMatchObject({ status: "IN_PROGRESS", totalScore: null, completedAt: null });
    expect(persisted.attempt.openAttemptKey).not.toBeNull();
    expect(persisted.areas).toHaveLength(0);
    expect(persisted.flags).toHaveLength(0);
  });

  it("39 respostas não deixam qualquer resultado parcial", async () => {
    const { user, attempt } = await createAnsweredAttempt("39", "A", "A", 39);
    await expect(resultService.completeForUser(user.id, attempt.id)).rejects.toMatchObject({ code: "INCOMPLETE_ATTEMPT" });
    const persisted = await persistedSnapshot(attempt.id);
    expect(persisted.attempt).toMatchObject({ status: "IN_PROGRESS", totalScore: null, completedAt: null });
    expect(persisted.attempt.openAttemptKey).not.toBeNull();
    expect(persisted.areas).toHaveLength(0);
    expect(persisted.flags).toHaveLength(0);
  });

  it("faz rollback se a persistência falhar depois das áreas", async () => {
    const { user, attempt } = await createAnsweredAttempt("rollback", "C");
    const failingService = new AdmissionResultService(prisma, { afterAreasPersisted: () => { throw new Error("falha controlada"); } });
    await expect(failingService.completeForUser(user.id, attempt.id)).rejects.toThrow("falha controlada");
    const persisted = await persistedSnapshot(attempt.id);
    expect(persisted.attempt).toMatchObject({ status: "IN_PROGRESS", totalScore: null, completedAt: null });
    expect(persisted.attempt.openAttemptKey).not.toBeNull();
    expect(persisted.areas).toHaveLength(0);
    expect(persisted.flags).toHaveLength(0);
  });

  it("reprocessa deterministicamente sem duplicar áreas ou flags", async () => {
    const { user, attempt } = await createAnsweredAttempt("reprocess", "C");
    await resultService.completeForUser(user.id, attempt.id);
    const first = await resultService.getAdmissionResultForUser(user.id, attempt.id);
    const reprocessed = await resultService.reprocessForUser(user.id, attempt.id);
    const second = await resultService.getAdmissionResultForUser(user.id, attempt.id);
    expect(reprocessed).toEqual(first);
    expect(second).toEqual(first);
    expect(await prisma.areaResult.count({ where: { attemptId: attempt.id } })).toBe(9);
    expect(await prisma.resultFlag.count({ where: { attemptId: attempt.id } })).toBe(4);
  });

  it("protege processamento e leitura por ownership", async () => {
    const owner = await createAnsweredAttempt("owner", "A");
    const attacker = await createUser("attacker");
    await expect(resultService.reprocessForUser(attacker.id, owner.attempt.id)).rejects.toMatchObject({ code: "ATTEMPT_NOT_FOUND" });
    await resultService.completeForUser(owner.user.id, owner.attempt.id);
    await expect(resultService.getAdmissionResultForUser(attacker.id, owner.attempt.id)).rejects.toMatchObject({ code: "RESULT_NOT_FOUND" });
  });
});
