// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMISSION_QUESTIONNAIRE_CODE, ADMISSION_QUESTIONNAIRE_VERSION } from "@/config/admission-questionnaire";
import { admissionQuestionnaireV8 } from "@/data/questionnaire-admission-v8";
import { createTestPrismaClient } from "@/test/create-test-prisma";
import { AdmissionFinancialProfileService } from "./admission-financial-profile.service";
import { AdmissionResultService } from "./admission-result.service";
import { AdmissionSafetyService } from "./admission-safety.service";
import { syncQuestionnaire } from "./questionnaire-seed.service";

const prisma = createTestPrismaClient();
const financialService = new AdmissionFinancialProfileService(prisma);
const resultService = new AdmissionResultService(prisma);
const safetyService = new AdmissionSafetyService(prisma);
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
  const user = await prisma.user.create({
    data: { name: `Financial ${label}`, email: `financial-${label}-${suffix}@example.test`, role },
  });
  userIds.push(user.id);
  return user;
}

async function createCompletedAttempt(label: string, financialLetter: "A" | "B" | "C") {
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
        : question.order >= 34 && question.order <= 38
          ? financialLetter
          : "A";
      const option = question.options.find((candidate) => candidate.letter === letter)!;
      return { attemptId: attempt.id, questionId: question.id, optionId: option.id, score: option.score };
    }),
  });
  await resultService.completeForUser(user.id, attempt.id);
  return { user, attempt };
}

async function persistedResult(attemptId: string) {
  const [areas, flags] = await Promise.all([
    prisma.areaResult.findMany({
      where: { attemptId },
      orderBy: { area: "asc" },
      select: { area: true, score: true, maxScore: true, averageScore: true, classification: true },
    }),
    prisma.resultFlag.findMany({ where: { attemptId }, orderBy: { code: "asc" }, select: { code: true, severity: true } }),
  ]);
  return { areas, flags };
}

describe("perfil financeiro owner-only de P34-P38", () => {
  beforeAll(async () => {
    await syncQuestionnaire(prisma, admissionQuestionnaireV8);
    questionnaire = await loadQuestionnaire();
  });

  afterAll(async () => {
    const attempts = await prisma.questionnaireAttempt.findMany({
      where: { userId: { in: userIds } },
      select: { id: true },
    });
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

  it("entrega ao owner as cinco dimensões derivadas por internalCode em DTO sanitizado", async () => {
    const owner = await createCompletedAttempt("owner", "B");
    const profile = await financialService.getFinancialProfileForOwner({
      userId: owner.user.id,
      attemptId: owner.attempt.id,
    });

    expect(profile).toEqual({
      housing: { code: "OWNED_FINANCED", label: "Imóvel próprio financiado" },
      incomeBand: { code: "FROM_5001_TO_10000", label: "De R$ 5.001 a R$ 10.000 por mês" },
      monthlyMargin: { code: "TIGHT", label: "Orçamento mensal bastante ajustado" },
      debtStatus: { code: "ATTENTION", label: "Compromissos que exigem atenção" },
      investmentCapacity: {
        code: "INSTALLMENTS",
        label: "Há capacidade principalmente com parcelamento ou opção mais acessível",
      },
    });
    expect(JSON.stringify(profile)).not.toMatch(
      /MORADIA_|RENDA_|MARGEM_|DIVIDA_|CAPACIDADE_|VULNERABILIDADE_|internalCode|answerId|optionId|score|passwordHash|userId|attemptId|QuestionOption|Answer/,
    );
  });

  it("nega um estranho que conhece o attemptId", async () => {
    const owner = await createCompletedAttempt("stranger-owner", "A");
    const stranger = await createUser("stranger");
    await expect(financialService.getFinancialProfileForOwner({
      userId: stranger.id,
      attemptId: owner.attempt.id,
    })).rejects.toMatchObject({ code: "FINANCIAL_PROFILE_FORBIDDEN" });
  });

  it("nega o parceiro legítimo do mesmo casal", async () => {
    const owner = await createCompletedAttempt("partner-owner", "A");
    const partner = await createUser("partner");
    const couple = await prisma.couple.create({ data: { status: "ACTIVE" } });
    coupleIds.push(couple.id);
    await prisma.coupleMember.createMany({ data: [
      { coupleId: couple.id, userId: owner.user.id, role: "CREATOR" },
      { coupleId: couple.id, userId: partner.id, role: "PARTNER" },
    ] });
    await prisma.questionnaireAttempt.update({ where: { id: owner.attempt.id }, data: { coupleId: couple.id } });

    await expect(financialService.getFinancialProfileForOwner({
      userId: partner.id,
      attemptId: owner.attempt.id,
    })).rejects.toMatchObject({ code: "FINANCIAL_PROFILE_FORBIDDEN" });
  });

  it("nega ADMIN no serviço normal, sem bypass", async () => {
    const owner = await createCompletedAttempt("admin-owner", "C");
    const admin = await createUser("admin", "ADMIN");
    await expect(financialService.getFinancialProfileForOwner({
      userId: admin.id,
      attemptId: owner.attempt.id,
    })).rejects.toMatchObject({ code: "FINANCIAL_PROFILE_FORBIDDEN" });
  });

  it("mantém score, áreas, classificação, counts, flags e Safety neutros e não persiste perfil duplicado", async () => {
    const allA = await createCompletedAttempt("neutral-a", "A");
    const allC = await createCompletedAttempt("neutral-c", "C");
    const countsBeforeRead = await Promise.all([
      prisma.questionnaireAttempt.count(),
      prisma.answer.count(),
      prisma.areaResult.count(),
      prisma.resultFlag.count(),
    ]);

    const [resultA, resultC, safetyA, safetyC, persistedA, persistedC, profileA, profileC] = await Promise.all([
      resultService.getAdmissionResultForUser(allA.user.id, allA.attempt.id),
      resultService.getAdmissionResultForUser(allC.user.id, allC.attempt.id),
      safetyService.getPrivateSafetyResultForUser(allA.user.id, allA.attempt.id),
      safetyService.getPrivateSafetyResultForUser(allC.user.id, allC.attempt.id),
      persistedResult(allA.attempt.id),
      persistedResult(allC.attempt.id),
      financialService.getFinancialProfileForOwner({ userId: allA.user.id, attemptId: allA.attempt.id }),
      financialService.getFinancialProfileForOwner({ userId: allC.user.id, attemptId: allC.attempt.id }),
    ]);

    expect(resultC).toEqual(resultA);
    expect(resultC.answerCounts).toEqual(resultA.answerCounts);
    expect(persistedC).toEqual(persistedA);
    expect(safetyC).toEqual(safetyA);
    expect(profileC).not.toEqual(profileA);
    expect(await Promise.all([
      prisma.questionnaireAttempt.count(),
      prisma.answer.count(),
      prisma.areaResult.count(),
      prisma.resultFlag.count(),
    ])).toEqual(countsBeforeRead);
  });
});
