// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMISSION_QUESTIONNAIRE_CODE, ADMISSION_QUESTIONNAIRE_VERSION } from "@/config/admission-questionnaire";
import { admissionQuestionnaireV8 } from "@/data/questionnaire-admission-v8";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import { syncQuestionnaire } from "./questionnaire-seed.service";
import { AdmissionIndividualReportService } from "./admission-individual-report.service";
import { AdmissionResultService } from "./admission-result.service";

const prisma = createTestPrismaClient();
const reportService = new AdmissionIndividualReportService(prisma);
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

async function createUser(label: string, role: "USER" | "ADMIN" = "USER") {
  const user = await prisma.user.create({ data: { name: `Report ${label}`, email: `report-${label}-${suffix}@example.test`, role } });
  userIds.push(user.id);
  return user;
}

async function createAttempt(userId: string, status: "STARTED" | "IN_PROGRESS" | "COMPLETED" = "STARTED") {
  return prisma.questionnaireAttempt.create({
    data: {
      questionnaireId: questionnaire.id,
      questionnaireVersion: questionnaire.version,
      userId,
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
      openAttemptKey: status === "COMPLETED" ? null : `${userId}:${questionnaire.id}`,
    },
  });
}

async function createCompletedAttempt(label: string, diagnosticLetter: "A" | "B" | "C", safetyLetter: "A" | "B" | "C") {
  const user = await createUser(label);
  const attempt = await createAttempt(user.id, "IN_PROGRESS");
  await prisma.answer.createMany({
    data: questionnaire.questions.map((question) => {
      const letter = question.order >= 6 && question.order <= 30 ? diagnosticLetter : question.order >= 31 && question.order <= 33 ? safetyLetter : "A";
      const option = question.options.find((candidate) => candidate.letter === letter)!;
      return { attemptId: attempt.id, questionId: question.id, optionId: option.id, score: option.score };
    }),
  });
  await resultService.completeForUser(user.id, attempt.id);
  return { user, attempt };
}

describe("serviço agregador do relatório individual", () => {
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

  it("retorna estado sem tentativa", async () => {
    const user = await createUser("not-started");
    await expect(reportService.getForUser(user.id)).resolves.toEqual({ kind: "NOT_STARTED" });
  });

  it("retorna andamento e contagem persistida", async () => {
    const user = await createUser("progress");
    const attempt = await createAttempt(user.id, "IN_PROGRESS");
    const question = questionnaire.questions[0];
    await prisma.answer.create({ data: { attemptId: attempt.id, questionId: question.id, optionId: question.options[0].id, score: null } });
    await expect(reportService.getForUser(user.id)).resolves.toEqual({ kind: "IN_PROGRESS", answerCount: 1 });
  });

  it("retorna resultado pendente sem recalcular em GET", async () => {
    const user = await createUser("pending");
    const attempt = await createAttempt(user.id, "COMPLETED");
    const before = await prisma.questionnaireAttempt.findUniqueOrThrow({ where: { id: attempt.id } });
    await expect(reportService.getForUser(user.id)).resolves.toEqual({ kind: "RESULT_PENDING" });
    const after = await prisma.questionnaireAttempt.findUniqueOrThrow({ where: { id: attempt.id } });
    expect(after).toEqual(before);
    expect(await prisma.areaResult.count({ where: { attemptId: attempt.id } })).toBe(0);
    expect(await prisma.resultFlag.count({ where: { attemptId: attempt.id } })).toBe(0);
  });

  it("monta relatório completo com nota amigável, nove áreas, counts, flags, Safety, data e versão", async () => {
    const owner = await createCompletedAttempt("ready", "C", "C");
    const state = await reportService.getForUser(owner.user.id, owner.attempt.id);
    expect(state.kind).toBe("READY");
    if (state.kind !== "READY") return;
    const areas = [...state.report.areaGroups.urgent, ...state.report.areaGroups.improvement, ...state.report.areaGroups.good];
    expect(state.report.general).toMatchObject({ rating: 0, ratingMax: 10, status: "PRECISA_MUDAR_COM_URGENCIA" });
    expect(areas).toHaveLength(9);
    expect(state.report.answerCounts).toEqual({ satisfactory: 0, intermediate: 0, relevantDifficulties: 25, total: 25 });
    expect(state.report.flags).toHaveLength(4);
    expect(state.report.safety?.overallLevel).toBe("HIGH_ALERT");
    expect(state.report.attempt.questionnaireVersion).toBe("8.0");
    expect(new Date(state.report.attempt.completedAt).toString()).not.toBe("Invalid Date");
    const serialized = JSON.stringify(state.report);
    expect(serialized).not.toMatch(/passwordHash|QuestionOption|internalCode|optionId|answerId|SAFETY_|CONSENT_|totalScore|maxScore|averageScore/);
  });

  it("omite bloco Safety para NONE e apresenta score interno 0 como nota 10", async () => {
    const owner = await createCompletedAttempt("none", "A", "A");
    const state = await reportService.getForUser(owner.user.id, owner.attempt.id);
    expect(state.kind).toBe("READY");
    if (state.kind === "READY") {
      expect(state.report.general).toMatchObject({ rating: 10, status: "ESTA_BOM" });
      expect(state.report.safety).toBeNull();
    }
  });

  it("GET do relatório pronto não altera tentativa, respostas, áreas ou flags", async () => {
    const owner = await createCompletedAttempt("readonly", "C", "B");
    const before = await Promise.all([
      prisma.questionnaireAttempt.findUniqueOrThrow({ where: { id: owner.attempt.id } }),
      prisma.answer.findMany({ where: { attemptId: owner.attempt.id }, orderBy: { questionId: "asc" } }),
      prisma.areaResult.findMany({ where: { attemptId: owner.attempt.id }, orderBy: { area: "asc" } }),
      prisma.resultFlag.findMany({ where: { attemptId: owner.attempt.id }, orderBy: { code: "asc" } }),
    ]);
    await reportService.getForUser(owner.user.id, owner.attempt.id);
    const after = await Promise.all([
      prisma.questionnaireAttempt.findUniqueOrThrow({ where: { id: owner.attempt.id } }),
      prisma.answer.findMany({ where: { attemptId: owner.attempt.id }, orderBy: { questionId: "asc" } }),
      prisma.areaResult.findMany({ where: { attemptId: owner.attempt.id }, orderBy: { area: "asc" } }),
      prisma.resultFlag.findMany({ where: { attemptId: owner.attempt.id }, orderBy: { code: "asc" } }),
    ]);
    expect(after).toEqual(before);
  });

  it("nega relatório de A para usuário B e ADMIN", async () => {
    const owner = await createCompletedAttempt("owner", "B", "C");
    const stranger = await createUser("stranger");
    const admin = await createUser("admin", "ADMIN");
    await expect(reportService.getForUser(stranger.id, owner.attempt.id)).rejects.toMatchObject({ code: "REPORT_FORBIDDEN" });
    await expect(reportService.getForUser(admin.id, owner.attempt.id)).rejects.toMatchObject({ code: "REPORT_FORBIDDEN" });
  });
});
