import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { ADMISSION_QUESTIONNAIRE_CODE, ADMISSION_QUESTIONNAIRE_VERSION } from "@/config/admission-questionnaire";
import {
  ADMISSION_PRIORITY_FLAGS,
  ADMISSION_SCORE_AREAS,
} from "@/features/admission/domain/admission-score-config";
import {
  AdmissionResultConfigurationError,
  calculateAdmissionResult,
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
        resultFlags: { orderBy: { code: "asc" } },
      },
    });
    if (!attempt || attempt.totalScore === null) throw new AdmissionAttemptError("RESULT_NOT_FOUND");

    const questions = await this.client.$transaction((transaction) => this.loadScoringQuestions(transaction, attempt.questionnaireId, attempt.id));
    const calculated = calculateAdmissionResult(questions);
    if (Number(attempt.totalScore) !== calculated.totalScore || attempt.areaResults.length !== 9) {
      throw new AdmissionAttemptError("RESULT_CONFIGURATION_ERROR");
    }
    const persistedAreas = new Map(attempt.areaResults.map((area) => [area.area, area]));
    if (calculated.areas.some((area) => {
      const persisted = persistedAreas.get(area.area);
      return !persisted || Number(persisted.score) !== area.score || Number(persisted.maxScore) !== area.maxScore ||
        persisted.averageScore.toFixed(2) !== area.averageScore || persisted.classification !== area.classification;
    })) throw new AdmissionAttemptError("RESULT_CONFIGURATION_ERROR");
    if (
      attempt.resultFlags.length !== calculated.flags.length ||
      calculated.flags.some((flag) => !attempt.resultFlags.some((persisted) => persisted.code === flag.code && persisted.severity === flag.severity))
    ) throw new AdmissionAttemptError("RESULT_CONFIGURATION_ERROR");
    return calculated;
  }
}
