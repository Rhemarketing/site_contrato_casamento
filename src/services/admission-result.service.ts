import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { ADMISSION_QUESTIONNAIRE_CODE, ADMISSION_QUESTIONNAIRE_VERSION } from "@/config/admission-questionnaire";
import {
  ADMISSION_AREA_CLASSIFICATIONS,
  ADMISSION_FLAG_SEVERITY,
  ADMISSION_MAX_SCORE,
  ADMISSION_PRIORITY_FLAGS,
  ADMISSION_SCORED_QUESTION_CODES,
  ADMISSION_SCORE_AREAS,
} from "@/features/admission/domain/admission-score-config";
import {
  AdmissionResultConfigurationError,
  calculateAdmissionResult,
  classifyAdmissionScore,
} from "@/features/admission/domain/admission-scoring";
import type { AdmissionCalculatedResult, AdmissionScoringQuestion } from "@/types/admission-result";
import { AdmissionAttemptError } from "./admission-attempt.errors";

type ProcessingHooks = { afterAreasPersisted?: () => Promise<void> | void };

export class AdmissionResultService {
  constructor(private readonly client: PrismaClient, private readonly hooks: ProcessingHooks = {}) {}

  private async loadScoringQuestions(
    transaction: Prisma.TransactionClient,
    questionnaireId: string,
    attemptId: string,
    incompleteAsAttemptError = false,
  ) {
    const questions = await transaction.question.findMany({
      where: { questionnaireId, isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        code: true,
        area: true,
        isScored: true,
        isPrivate: true,
        answers: {
          where: { attemptId },
          select: {
            questionId: true,
            optionId: true,
            score: true,
            option: { select: { id: true, questionId: true, letter: true, score: true, flag: true } },
          },
        },
      },
    });

    return questions.map((question): AdmissionScoringQuestion => {
      if (question.answers.length !== 1) {
        if (incompleteAsAttemptError) throw new AdmissionAttemptError("INCOMPLETE_ATTEMPT");
        throw new AdmissionResultConfigurationError();
      }
      const answer = question.answers[0];
      return {
        id: question.id,
        code: question.code,
        area: question.area,
        isScored: question.isScored,
        isPrivate: question.isPrivate,
        answer: {
          questionId: answer.questionId,
          optionId: answer.optionId,
          score: answer.score === null ? null : Number(answer.score),
          option: {
            ...answer.option,
            score: answer.option.score === null ? null : Number(answer.option.score),
          },
        },
      };
    });
  }

  private async processInTransaction(
    transaction: Prisma.TransactionClient,
    userId: string,
    attemptId: string,
    allowCompleted: boolean,
  ) {
    const attempt = await transaction.questionnaireAttempt.findFirst({
      where: { id: attemptId, userId },
      include: { questionnaire: { select: { code: true, version: true } } },
    });
    if (!attempt) throw new AdmissionAttemptError("ATTEMPT_NOT_FOUND");
    if (
      attempt.questionnaire.code !== ADMISSION_QUESTIONNAIRE_CODE ||
      attempt.questionnaire.version !== ADMISSION_QUESTIONNAIRE_VERSION
    ) throw new AdmissionAttemptError("RESULT_CONFIGURATION_ERROR");
    if (attempt.status === "COMPLETED" && !allowCompleted) return { attempt, calculated: null };
    if (!allowCompleted) {
      const claimed = await transaction.questionnaireAttempt.updateMany({
        where: { id: attemptId, userId, status: { in: ["STARTED", "IN_PROGRESS"] } },
        data: { updatedAt: new Date() },
      });
      if (claimed.count !== 1) throw Object.assign(new Error("RESULT_PROCESSING_CONFLICT"), { code: "P2034" });
    }

    const questions = await this.loadScoringQuestions(transaction, attempt.questionnaireId, attemptId, true);
    const calculated = calculateAdmissionResult(questions);

    for (const area of calculated.areas) {
      await transaction.areaResult.upsert({
        where: { attemptId_area: { attemptId, area: area.area } },
        create: { attemptId, ...area },
        update: { score: area.score, maxScore: area.maxScore, averageScore: area.averageScore, classification: area.classification },
      });
    }
    await transaction.areaResult.deleteMany({
      where: { attemptId, area: { notIn: ADMISSION_SCORE_AREAS.map(({ key }) => key) } },
    });
    await this.hooks.afterAreasPersisted?.();

    const selectedFlagCodes = calculated.flags.map(({ code }) => code);
    const staleOfficialFlags = Object.values(ADMISSION_PRIORITY_FLAGS).filter((code) => !selectedFlagCodes.includes(code));
    if (staleOfficialFlags.length) {
      await transaction.resultFlag.deleteMany({ where: { attemptId, code: { in: staleOfficialFlags } } });
    }
    for (const flag of calculated.flags) {
      await transaction.resultFlag.upsert({
        where: { attemptId_code: { attemptId, code: flag.code } },
        create: { attemptId, questionId: flag.questionId, code: flag.code, severity: flag.severity },
        update: { questionId: flag.questionId, severity: flag.severity },
      });
    }

    const completedAt = attempt.completedAt ?? new Date();
    const updatedAttempt = await transaction.questionnaireAttempt.update({
      where: { id: attemptId },
      data: { totalScore: calculated.totalScore, status: "COMPLETED", completedAt, openAttemptKey: null },
    });
    return { attempt: updatedAttempt, calculated };
  }

  private async runTransactionWithConflictRetry<T>(operation: (transaction: Prisma.TransactionClient) => Promise<T>) {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.client.$transaction(operation);
      } catch (error) {
        lastError = error;
        const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
        if (!["P2002", "P2034"].includes(code)) throw error;
      }
    }
    throw lastError;
  }

  async completeForUser(userId: string, attemptId: string) {
    const processed = await this.runTransactionWithConflictRetry((transaction) => this.processInTransaction(transaction, userId, attemptId, false));
    return processed.attempt;
  }

  async reprocessForUser(userId: string, attemptId: string) {
    const processed = await this.runTransactionWithConflictRetry((transaction) => this.processInTransaction(transaction, userId, attemptId, true));
    if (!processed.calculated) throw new AdmissionAttemptError("RESULT_CONFIGURATION_ERROR");
    return processed.calculated;
  }

  async getAdmissionResultForUser(userId: string, attemptId?: string): Promise<AdmissionCalculatedResult> {
    const attempt = await this.client.questionnaireAttempt.findFirst({
      where: {
        ...(attemptId ? { id: attemptId } : {}),
        userId,
        status: "COMPLETED",
        questionnaire: { code: ADMISSION_QUESTIONNAIRE_CODE, version: ADMISSION_QUESTIONNAIRE_VERSION },
      },
      orderBy: { completedAt: "desc" },
      include: {
        areaResults: { orderBy: { area: "asc" } },
        resultFlags: { orderBy: { code: "asc" }, include: { question: { select: { code: true } } } },
        answers: {
          where: { question: { isScored: true } },
          select: { question: { select: { code: true } }, option: { select: { letter: true } } },
        },
      },
    });
    if (!attempt || attempt.totalScore === null) throw new AdmissionAttemptError("RESULT_NOT_FOUND");
    const totalScore = Number(attempt.totalScore);
    if (!Number.isInteger(totalScore) || totalScore < 0 || totalScore > ADMISSION_MAX_SCORE || attempt.areaResults.length !== 9) {
      throw new AdmissionAttemptError("RESULT_CONFIGURATION_ERROR");
    }

    const areaConfig = new Map(ADMISSION_SCORE_AREAS.map((area) => [area.key, area]));
    const knownAreaClassifications = new Set(Object.values(ADMISSION_AREA_CLASSIFICATIONS));
    const areas = attempt.areaResults.map((area) => {
      const expected = areaConfig.get(area.area as typeof ADMISSION_SCORE_AREAS[number]["key"]);
      const score = Number(area.score);
      const maxScore = Number(area.maxScore);
      const averageScore = area.averageScore.toFixed(2);
      if (!expected || maxScore !== expected.maxScore || score < 0 || score > maxScore || Number(averageScore) < 0 || Number(averageScore) > 2 ||
        !knownAreaClassifications.has(area.classification as typeof ADMISSION_AREA_CLASSIFICATIONS[keyof typeof ADMISSION_AREA_CLASSIFICATIONS])) {
        throw new AdmissionAttemptError("RESULT_CONFIGURATION_ERROR");
      }
      return { area: area.area, score, maxScore, averageScore, classification: area.classification as typeof ADMISSION_AREA_CLASSIFICATIONS[keyof typeof ADMISSION_AREA_CLASSIFICATIONS] };
    }).sort((left, right) => ADMISSION_SCORE_AREAS.findIndex(({ key }) => key === left.area) - ADMISSION_SCORE_AREAS.findIndex(({ key }) => key === right.area));
    if (new Set(areas.map(({ area }) => area)).size !== 9 || areas.reduce((sum, area) => sum + area.score, 0) !== totalScore) {
      throw new AdmissionAttemptError("RESULT_CONFIGURATION_ERROR");
    }

    const scoredCodes = new Set<string>(ADMISSION_SCORED_QUESTION_CODES);
    const answerCounts = { A: 0, B: 0, C: 0 };
    if (attempt.answers.length !== 25 || attempt.answers.some(({ question }) => !scoredCodes.has(question.code))) {
      throw new AdmissionAttemptError("RESULT_CONFIGURATION_ERROR");
    }
    for (const answer of attempt.answers) {
      if (!Object.hasOwn(answerCounts, answer.option.letter)) throw new AdmissionAttemptError("RESULT_CONFIGURATION_ERROR");
      answerCounts[answer.option.letter as keyof typeof answerCounts] += 1;
    }

    const expectedFlagByCode = new Map<string, string>(Object.entries(ADMISSION_PRIORITY_FLAGS).map(([questionCode, code]) => [code, questionCode]));
    const flags = attempt.resultFlags.map((flag) => {
      const expectedQuestionCode = expectedFlagByCode.get(flag.code);
      if (!expectedQuestionCode || flag.severity !== ADMISSION_FLAG_SEVERITY || flag.question?.code !== expectedQuestionCode) {
        throw new AdmissionAttemptError("RESULT_CONFIGURATION_ERROR");
      }
      return { code: flag.code, questionId: flag.questionId ?? "", questionCode: expectedQuestionCode, severity: ADMISSION_FLAG_SEVERITY };
    }).sort((left, right) => Object.values(ADMISSION_PRIORITY_FLAGS).indexOf(left.code as typeof ADMISSION_PRIORITY_FLAGS[keyof typeof ADMISSION_PRIORITY_FLAGS]) - Object.values(ADMISSION_PRIORITY_FLAGS).indexOf(right.code as typeof ADMISSION_PRIORITY_FLAGS[keyof typeof ADMISSION_PRIORITY_FLAGS]));
    if (new Set(flags.map(({ code }) => code)).size !== flags.length) throw new AdmissionAttemptError("RESULT_CONFIGURATION_ERROR");

    return { totalScore, maxScore: ADMISSION_MAX_SCORE, classification: classifyAdmissionScore(totalScore), answerCounts, areas, flags };
  }
}
