// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMISSION_QUESTIONNAIRE_CODE, ADMISSION_QUESTIONNAIRE_VERSION } from "@/config/admission-questionnaire";
import { admissionQuestionnaireV8 } from "@/data/questionnaire-admission-v8";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import { syncQuestionnaire } from "./questionnaire-seed.service";
import { AdmissionAttemptService } from "./admission-attempt.service";

const prisma = createTestPrismaClient();
const service = new AdmissionAttemptService(prisma);
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const fixtureUserIds: string[] = [];
let questionnaire: Awaited<ReturnType<typeof loadQuestionnaire>>;
let foreignQuestionnaireId: string | undefined;

function loadQuestionnaire() {
  return prisma.questionnaire.findUniqueOrThrow({
    where: { code_version: { code: ADMISSION_QUESTIONNAIRE_CODE, version: ADMISSION_QUESTIONNAIRE_VERSION } },
    include: { questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } } },
  });
}

async function createUser(label: string) {
  const user = await prisma.user.create({ data: { name: `Admission ${label}`, email: `admission-${label}-${suffix}@example.test` } });
  fixtureUserIds.push(user.id);
  return user;
}

async function answerThrough(userId: string, attemptId: string, lastOrder: number) {
  for (const question of questionnaire.questions.slice(0, lastOrder)) {
    const existing = await prisma.answer.findUnique({ where: { attemptId_questionId: { attemptId, questionId: question.id } } });
    if (!existing) await service.saveAnswer(userId, attemptId, question.id, question.options[0].id);
  }
}

describe("fluxo funcional da Prova de Admissão", () => {
  beforeAll(async () => {
    await syncQuestionnaire(prisma, admissionQuestionnaireV8);
    questionnaire = await loadQuestionnaire();
  });

  afterAll(async () => {
    const attempts = await prisma.questionnaireAttempt.findMany({ where: { userId: { in: fixtureUserIds } }, select: { id: true } });
    const attemptIds = attempts.map(({ id }) => id);
    await prisma.answer.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.areaResult.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.resultFlag.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.questionnaireAttempt.deleteMany({ where: { id: { in: attemptIds } } });
    await prisma.user.deleteMany({ where: { id: { in: fixtureUserIds } } });
    if (foreignQuestionnaireId) {
      await prisma.questionOption.deleteMany({ where: { question: { questionnaireId: foreignQuestionnaireId } } });
      await prisma.question.deleteMany({ where: { questionnaireId: foreignQuestionnaireId } });
      await prisma.questionnaire.delete({ where: { id: foreignQuestionnaireId } });
    }
    await prisma.$disconnect();
  });

  it("cria STARTED com versão 8.0 e reutiliza a tentativa aberta", async () => {
    const user = await createUser("start");
    const first = await service.startOrResume(user.id);
    const second = await service.startOrResume(user.id);
    expect(second.id).toBe(first.id);
    expect(first).toMatchObject({ userId: user.id, questionnaireId: questionnaire.id, questionnaireVersion: "8.0", status: "STARTED", totalScore: null, coupleId: null });
    expect(first.openAttemptKey).toBe(`${user.id}:${questionnaire.id}`);
    expect(await prisma.questionnaireAttempt.count({ where: { userId: user.id, status: { in: ["STARTED", "IN_PROGRESS"] } } })).toBe(1);
  });

  it("a constraint mantém somente uma tentativa aberta sob concorrência", async () => {
    const user = await createUser("concurrent-start");
    const attempts = await Promise.all(Array.from({ length: 6 }, () => service.startOrResume(user.id)));
    expect(new Set(attempts.map(({ id }) => id)).size).toBe(1);
    expect(await prisma.questionnaireAttempt.count({ where: { openAttemptKey: `${user.id}:${questionnaire.id}` } })).toBe(1);
  });

  it("salva score exclusivamente da alternativa e atualiza sem duplicar Answer", async () => {
    const user = await createUser("scores");
    const attempt = await service.startOrResume(user.id);
    await answerThrough(user.id, attempt.id, 5);
    const p01 = await prisma.answer.findUniqueOrThrow({ where: { attemptId_questionId: { attemptId: attempt.id, questionId: questionnaire.questions[0].id } } });
    expect(p01.score).toBeNull();

    const p06 = questionnaire.questions[5];
    await service.saveAnswer(user.id, attempt.id, p06.id, p06.options[0].id);
    expect(Number((await prisma.answer.findUniqueOrThrow({ where: { attemptId_questionId: { attemptId: attempt.id, questionId: p06.id } } })).score)).toBe(0);
    await service.saveAnswer(user.id, attempt.id, p06.id, p06.options[2].id);
    expect(Number((await prisma.answer.findUniqueOrThrow({ where: { attemptId_questionId: { attemptId: attempt.id, questionId: p06.id } } })).score)).toBe(2);
    expect(await prisma.answer.count({ where: { attemptId: attempt.id, questionId: p06.id } })).toBe(1);
    expect((await prisma.questionnaireAttempt.findUniqueOrThrow({ where: { id: attempt.id } })).status).toBe("IN_PROGRESS");
  });

  it("impede pulo, alternativa de outra pergunta e pergunta de outro questionário", async () => {
    const user = await createUser("validation");
    const attempt = await service.startOrResume(user.id);
    const [p01, p02] = questionnaire.questions;
    await expect(service.saveAnswer(user.id, attempt.id, p02.id, p02.options[0].id)).rejects.toMatchObject({ code: "OUT_OF_SEQUENCE" });
    await expect(service.saveAnswer(user.id, attempt.id, p01.id, p02.options[0].id)).rejects.toMatchObject({ code: "OPTION_NOT_IN_QUESTION" });

    const foreign = await prisma.questionnaire.create({ data: { code: `FOREIGN_${suffix}`, name: "Foreign", version: "1.0" } });
    foreignQuestionnaireId = foreign.id;
    const foreignQuestion = await prisma.question.create({ data: { questionnaireId: foreign.id, code: "F01", order: 1, stage: "foreign", area: "foreign", text: "Foreign" } });
    const foreignOption = await prisma.questionOption.create({ data: { questionId: foreignQuestion.id, letter: "A", text: "Foreign", score: 0, order: 1 } });
    await expect(service.saveAnswer(user.id, attempt.id, foreignQuestion.id, foreignOption.id)).rejects.toMatchObject({ code: "QUESTION_NOT_IN_ATTEMPT" });
  });

  it("permite editar anterior e retoma na primeira pergunta sem resposta", async () => {
    const user = await createUser("resume");
    const attempt = await service.startOrResume(user.id);
    await answerThrough(user.id, attempt.id, 10);
    await service.saveAnswer(user.id, attempt.id, questionnaire.questions[2].id, questionnaire.questions[2].options[1].id);
    const state = await service.getState(user.id);
    expect(state.kind).toBe("OPEN");
    if (state.kind === "OPEN") {
      expect(state.currentQuestionIndex).toBe(10);
      expect(state.questions[10].code).toBe("P11");
      expect(state.answers).toHaveLength(10);
    }
  });

  it("protege leitura, gravação e conclusão por ownership", async () => {
    const owner = await createUser("owner");
    const attacker = await createUser("attacker");
    const attempt = await service.startOrResume(owner.id);
    await expect(service.getStateForAttempt(attacker.id, attempt.id)).rejects.toMatchObject({ code: "ATTEMPT_NOT_FOUND" });
    await expect(service.saveAnswer(attacker.id, attempt.id, questionnaire.questions[0].id, questionnaire.questions[0].options[0].id)).rejects.toMatchObject({ code: "ATTEMPT_NOT_FOUND" });
    await expect(service.complete(attacker.id, attempt.id)).rejects.toMatchObject({ code: "ATTEMPT_NOT_FOUND" });
  });

  it("persiste P31 para o proprietário sem expor metadados privados no DTO", async () => {
    const user = await createUser("private");
    const attempt = await service.startOrResume(user.id);
    await answerThrough(user.id, attempt.id, 31);
    const p31Answer = await prisma.answer.findUnique({ where: { attemptId_questionId: { attemptId: attempt.id, questionId: questionnaire.questions[30].id } } });
    expect(p31Answer).not.toBeNull();
    const state = await service.getState(user.id);
    expect(state.kind).toBe("OPEN");
    if (state.kind === "OPEN") {
      const serialized = JSON.stringify(state.questions.find(({ code }) => code === "P31"));
      expect(serialized).not.toContain("internalCode");
      expect(serialized).not.toContain("flag");
      expect(serialized).not.toContain("score");
    }
  });

  it("autosaves concorrentes preservam uma única Answer", async () => {
    const user = await createUser("concurrent-answer");
    const attempt = await service.startOrResume(user.id);
    const p01 = questionnaire.questions[0];
    const results = await Promise.allSettled([
      service.saveAnswer(user.id, attempt.id, p01.id, p01.options[0].id),
      service.saveAnswer(user.id, attempt.id, p01.id, p01.options[1].id),
    ]);
    expect(results.some(({ status }) => status === "fulfilled")).toBe(true);
    expect(await prisma.answer.count({ where: { attemptId: attempt.id, questionId: p01.id } })).toBe(1);
  });

  it("recusa conclusão com 39 respostas", async () => {
    const user = await createUser("incomplete");
    const attempt = await service.startOrResume(user.id);
    await answerThrough(user.id, attempt.id, 39);
    await expect(service.complete(user.id, attempt.id)).rejects.toMatchObject({ code: "INCOMPLETE_ATTEMPT" });
    expect((await prisma.questionnaireAttempt.findUniqueOrThrow({ where: { id: attempt.id } })).status).toBe("IN_PROGRESS");
  });

  it("executa P01-P40, conclui com resultado e não cria nova tentativa", async () => {
    const user = await createUser("complete");
    const attempt = await service.startOrResume(user.id);
    await answerThrough(user.id, attempt.id, 40);
    expect(await prisma.answer.count({ where: { attemptId: attempt.id } })).toBe(40);
    const [completedA, completedB] = await Promise.all([service.complete(user.id, attempt.id), service.complete(user.id, attempt.id)]);
    expect(completedA.status).toBe("COMPLETED");
    expect(completedB.status).toBe("COMPLETED");
    const persisted = await prisma.questionnaireAttempt.findUniqueOrThrow({ where: { id: attempt.id } });
    expect(persisted.completedAt).not.toBeNull();
    expect(persisted.openAttemptKey).toBeNull();
    expect(Number(persisted.totalScore)).toBe(0);
    expect(await prisma.areaResult.count({ where: { attemptId: attempt.id } })).toBe(9);
    expect(await prisma.resultFlag.count({ where: { attemptId: attempt.id } })).toBe(0);
    await expect(service.saveAnswer(user.id, attempt.id, questionnaire.questions[0].id, questionnaire.questions[0].options[0].id)).rejects.toMatchObject({ code: "ATTEMPT_ALREADY_COMPLETED" });
    expect((await service.startOrResume(user.id)).id).toBe(attempt.id);
    expect(await prisma.questionnaireAttempt.count({ where: { userId: user.id } })).toBe(1);
  });
});
