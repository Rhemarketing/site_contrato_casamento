// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMISSION_QUESTIONNAIRE_CODE, ADMISSION_QUESTIONNAIRE_VERSION } from "@/config/admission-questionnaire";
import { admissionQuestionnaireV8 } from "@/data/questionnaire-admission-v8";
import { PrismaCoupleComparisonRepository } from "@/repositories/prisma/prisma-couple-comparison.repository";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import { AdmissionResultService } from "./admission-result.service";
import { CoupleComparisonService } from "./couple-comparison.service";
import { syncQuestionnaire } from "./questionnaire-seed.service";

const prisma = createTestPrismaClient();
const repository = new PrismaCoupleComparisonRepository(prisma);
const service = new CoupleComparisonService(repository);
const resultService = new AdmissionResultService(prisma);
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const userIds: string[] = [];
const coupleIds: string[] = [];
const attemptIds: string[] = [];
let questionnaire: Awaited<ReturnType<typeof loadQuestionnaire>>;

function loadQuestionnaire() {
  return prisma.questionnaire.findUniqueOrThrow({
    where: {
      code_version: {
        code: ADMISSION_QUESTIONNAIRE_CODE,
        version: ADMISSION_QUESTIONNAIRE_VERSION,
      },
    },
    include: {
      questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } },
    },
  });
}

async function createUser(label: string, role: "USER" | "ADMIN" = "USER") {
  const user = await prisma.user.create({
    data: {
      name: `Comparison ${label}`,
      email: `comparison-${label}-${suffix}@example.test`,
      role,
    },
  });
  userIds.push(user.id);
  return user;
}

async function createCouple(label: string, status: "PENDING" | "ACTIVE" = "ACTIVE") {
  const creator = await createUser(`${label}-creator`);
  const partner = await createUser(`${label}-partner`);
  const couple = await prisma.couple.create({
    data: {
      status,
      members: {
        create: [
          { userId: creator.id, role: "CREATOR", activeMembershipKey: creator.id },
          { userId: partner.id, role: "PARTNER", activeMembershipKey: partner.id },
        ],
      },
    },
  });
  coupleIds.push(couple.id);
  return { creator, partner, couple };
}

async function completeAttempt(userId: string, diagnosticLetter: "A" | "B" | "C") {
  const attempt = await prisma.questionnaireAttempt.create({
    data: {
      questionnaireId: questionnaire.id,
      questionnaireVersion: questionnaire.version,
      userId,
      status: "IN_PROGRESS",
      openAttemptKey: `${userId}:${questionnaire.id}`,
    },
  });
  attemptIds.push(attempt.id);
  await prisma.answer.createMany({
    data: questionnaire.questions.map((question) => {
      const letter = question.order >= 6 && question.order <= 30 ? diagnosticLetter : "C";
      const option = question.options.find((candidate) => candidate.letter === letter)!;
      return {
        attemptId: attempt.id,
        questionId: question.id,
        optionId: option.id,
        score: option.score,
      };
    }),
  });
  await resultService.completeForUser(userId, attempt.id);
  return attempt;
}

describe("consentimento e comparação segura do casal", () => {
  beforeAll(async () => {
    await syncQuestionnaire(prisma, admissionQuestionnaireV8);
    questionnaire = await loadQuestionnaire();
  });

  afterAll(async () => {
    await prisma.coupleComparisonConsent.deleteMany({ where: { coupleId: { in: coupleIds } } });
    await prisma.answer.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.areaResult.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.resultFlag.deleteMany({ where: { attemptId: { in: attemptIds } } });
    await prisma.questionnaireAttempt.deleteMany({ where: { id: { in: attemptIds } } });
    await prisma.coupleMember.deleteMany({ where: { coupleId: { in: coupleIds } } });
    await prisma.couple.deleteMany({ where: { id: { in: coupleIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  });

  it("não libera casal não ACTIVE nem usuário que não é membro", async () => {
    const pending = await createCouple("pending", "PENDING");
    const outsider = await createUser("outsider");
    expect(await service.getForUser(pending.creator.id)).toEqual({ state: "PARTNER_NOT_CONNECTED" });
    expect(await service.getForUser(outsider.id)).toEqual({ state: "PARTNER_NOT_CONNECTED" });
    await expect(service.consent(pending.creator.id)).rejects.toMatchObject({ code: "COMPARISON_COUPLE_NOT_ACTIVE" });
    await expect(service.consent(outsider.id)).rejects.toMatchObject({ code: "COMPARISON_COUPLE_NOT_ACTIVE" });
  });

  it("mantém indisponível com apenas uma prova e exige conclusão para consentir", async () => {
    const pair = await createCouple("one-completed");
    await completeAttempt(pair.creator.id, "A");
    expect(await service.getForUser(pair.creator.id)).toEqual({ state: "WAITING_COMPLETION" });
    await expect(service.consent(pair.partner.id)).rejects.toMatchObject({
      code: "COMPARISON_ADMISSION_NOT_COMPLETED",
    });
  });

  it("com duas provas exige consentimento próprio e depois o do parceiro", async () => {
    const pair = await createCouple("consent-states");
    await Promise.all([
      completeAttempt(pair.creator.id, "A"),
      completeAttempt(pair.partner.id, "B"),
    ]);
    expect(await service.getForUser(pair.creator.id)).toEqual({ state: "WAITING_OWN_CONSENT" });
    expect(await prisma.coupleComparisonConsent.count({ where: { coupleId: pair.couple.id } })).toBe(0);
    await service.consent(pair.creator.id);
    expect(await service.getForUser(pair.creator.id)).toEqual({
      state: "WAITING_PARTNER_CONSENT",
      canRevoke: true,
    });
  });

  it("consentimento é idempotente e a constraint impede duplicidade", async () => {
    const pair = await createCouple("idempotent");
    await completeAttempt(pair.creator.id, "A");
    await Promise.all([service.consent(pair.creator.id), service.consent(pair.creator.id)]);
    expect(await prisma.coupleComparisonConsent.count({
      where: {
        coupleId: pair.couple.id,
        userId: pair.creator.id,
        questionnaireVersion: ADMISSION_QUESTIONNAIRE_VERSION,
      },
    })).toBe(1);
  });

  it("libera após dois consentimentos e retorna DTO sem respostas brutas ou dados proibidos", async () => {
    const pair = await createCouple("available");
    await Promise.all([
      completeAttempt(pair.creator.id, "A"),
      completeAttempt(pair.partner.id, "C"),
    ]);
    await Promise.all([service.consent(pair.creator.id), service.consent(pair.partner.id)]);
    const state = await service.getForUser(pair.creator.id);
    expect(state.state).toBe("AVAILABLE");
    if (state.state !== "AVAILABLE") throw new Error("comparison should be available");
    expect(state.comparison.questions).toHaveLength(25);
    expect(state.comparison.areas).toHaveLength(9);
    expect(state.comparison.questions.map(({ questionCode }) => questionCode)).toEqual(
      Array.from({ length: 25 }, (_, index) => `P${String(index + 6).padStart(2, "0")}`),
    );
    const serialized = JSON.stringify(state);
    expect(serialized).not.toMatch(/P0[1-5]|P3[1-9]|P40/);
    expect(serialized).not.toMatch(/Answer|answerId|optionId|internalCode|ResultFlag|Safety|financial|scorePessoa|userId|coupleId|attemptId/i);
  });

  it("revogação torna uma comparação disponível imediatamente indisponível sem apagar provas", async () => {
    const pair = await createCouple("revoke");
    await Promise.all([
      completeAttempt(pair.creator.id, "A"),
      completeAttempt(pair.partner.id, "B"),
    ]);
    await Promise.all([service.consent(pair.creator.id), service.consent(pair.partner.id)]);
    expect((await service.getForUser(pair.creator.id)).state).toBe("AVAILABLE");
    const attemptsBefore = await prisma.questionnaireAttempt.count({
      where: { userId: { in: [pair.creator.id, pair.partner.id] } },
    });
    await service.revoke(pair.creator.id);
    expect(await service.getForUser(pair.creator.id)).toEqual({ state: "WAITING_OWN_CONSENT" });
    expect((await service.getForUser(pair.partner.id)).state).toBe("WAITING_PARTNER_CONSENT");
    expect(await prisma.questionnaireAttempt.count({
      where: { userId: { in: [pair.creator.id, pair.partner.id] } },
    })).toBe(attemptsBefore);
  });

  it("não aceita IDOR e ADMIN não possui bypass do fluxo normal", async () => {
    const pair = await createCouple("ownership");
    const admin = await createUser("admin", "ADMIN");
    await Promise.all([
      completeAttempt(pair.creator.id, "A"),
      completeAttempt(pair.partner.id, "B"),
    ]);
    await Promise.all([service.consent(pair.creator.id), service.consent(pair.partner.id)]);
    expect((await service.getForUser(pair.creator.id)).state).toBe("AVAILABLE");
    expect(await service.getForUser(admin.id)).toEqual({ state: "PARTNER_NOT_CONNECTED" });
    await expect(service.consent(admin.id)).rejects.toMatchObject({ code: "COMPARISON_COUPLE_NOT_ACTIVE" });
  });
});
