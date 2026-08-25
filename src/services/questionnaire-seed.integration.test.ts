// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { admissionQuestionnaireV8 } from "@/data/questionnaire-admission-v8";
import { HISTORICAL_VERSION_ERROR, syncQuestionnaire } from "./questionnaire-seed.service";
import { createTestPrismaClient } from "@/test/create-test-prisma";

const prisma = createTestPrismaClient();
const key = { code: admissionQuestionnaireV8.questionario.codigo, version: admissionQuestionnaireV8.questionario.versao };

async function clearFixture() {
  const questionnaire = await prisma.questionnaire.findUnique({ where: { code_version: key }, include: { questions: { select: { id: true } }, attempts: { select: { id: true, userId: true } } } });
  if (!questionnaire) return;
  const attemptIds = questionnaire.attempts.map((attempt) => attempt.id);
  if (attemptIds.length) {
    await prisma.answer.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.areaResult.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.resultFlag.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.questionnaireAttempt.deleteMany({ where: { id: { in: attemptIds } } });
    await prisma.user.deleteMany({ where: { id: { in: questionnaire.attempts.map((attempt) => attempt.userId) } } });
  }
  await prisma.questionOption.deleteMany({ where: { questionId: { in: questionnaire.questions.map((question) => question.id) } } });
  await prisma.question.deleteMany({ where: { questionnaireId: questionnaire.id } });
  await prisma.questionnaire.delete({ where: { id: questionnaire.id } });
}

describe("seed transacional do questionário 8.0", () => {
  beforeAll(clearFixture);
  afterAll(async () => { await clearFixture(); await prisma.$disconnect(); });

  it("cria exatamente um questionário, 40 perguntas e 120 alternativas", async () => {
    await syncQuestionnaire(prisma, admissionQuestionnaireV8);
    const questionnaire = await prisma.questionnaire.findUniqueOrThrow({ where: { code_version: key }, include: { questions: { include: { options: true } } } });
    expect(await prisma.questionnaire.count({ where: key })).toBe(1);
    expect(questionnaire.questions).toHaveLength(40);
    expect(questionnaire.questions.flatMap((question) => question.options)).toHaveLength(120);
  });

  it("é idempotente em execuções repetidas", async () => {
    await syncQuestionnaire(prisma, admissionQuestionnaireV8);
    expect(await prisma.questionnaire.count({ where: key })).toBe(1);
    expect(await prisma.question.count({ where: { questionnaire: key } })).toBe(40);
    expect(await prisma.questionOption.count({ where: { question: { questionnaire: key } } })).toBe(120);
  });

  it("persiste pontuação, privacidade, flags e internal codes", async () => {
    const questions = await prisma.question.findMany({ where: { questionnaire: key }, include: { options: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } });
    expect(questions.slice(30, 33).every((question) => question.isPrivate)).toBe(true);
    expect(questions[33].isPrivate).toBe(false);
    expect(questions[5].options.map((option) => Number(option.score))).toEqual([0, 1, 2]);
    expect(questions[0].options.every((option) => option.score === null)).toBe(true);
    expect(questions[39].options.every((option) => option.score === null)).toBe(true);
    expect(questions.flatMap((question) => question.options.map((option) => option.flag).filter(Boolean))).toEqual([
      "CONVERSA_INTIMIDADE_PRIORITARIA", "FERIDA_CONFIANCA_PRIORITARIA", "INSATISFACAO_FUTURO_PRIORITARIA", "HABITO_COMPULSIVO_PRIORITARIO",
    ]);
    expect(questions[30].options.map((option) => option.internalCode)).toEqual(["SAFETY_0", "SAFETY_ATTENTION", "SAFETY_ALERT"]);
  });

  it("recusa modificar uma versão com tentativa histórica", async () => {
    const questionnaire = await prisma.questionnaire.findUniqueOrThrow({ where: { code_version: key } });
    const user = await prisma.user.create({ data: { name: "Historical Test", email: `historical-${Date.now()}@example.test` } });
    await prisma.questionnaireAttempt.create({ data: { questionnaireId: questionnaire.id, questionnaireVersion: "8.0", userId: user.id } });
    const changed = structuredClone(admissionQuestionnaireV8) as unknown as { perguntas: Array<{ pergunta: string }> };
    changed.perguntas[5].pergunta = "Conteúdo incompatível";
    await expect(syncQuestionnaire(prisma, changed)).rejects.toThrow(HISTORICAL_VERSION_ERROR);
    expect((await prisma.question.findUniqueOrThrow({ where: { questionnaireId_code: { questionnaireId: questionnaire.id, code: "P06" } } })).text).not.toBe("Conteúdo incompatível");
  });
});
