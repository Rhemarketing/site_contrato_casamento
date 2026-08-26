import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import {
  ADMISSION_QUESTIONNAIRE_CODE,
  ADMISSION_QUESTION_COUNT,
  ADMISSION_QUESTIONNAIRE_VERSION,
} from "@/config/admission-questionnaire";
import {
  canSaveQuestionInSequence,
  findFirstUnansweredIndex,
  toAdmissionQuestionDto,
} from "@/features/admission/domain/admission-state";
import type { AdmissionAttemptState, AdmissionAttemptSummary } from "@/types/admission";
import { AdmissionAttemptError } from "./admission-attempt.errors";
import { AdmissionResultService } from "./admission-result.service";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function openAttemptKey(userId: string, questionnaireId: string) {
  return `${userId}:${questionnaireId}`;
}

export class AdmissionAttemptService {
  constructor(private readonly client: PrismaClient) {}

  private findExpectedQuestionnaire(activeOnly = false) {
    return this.client.questionnaire.findFirst({
      where: {
        code: ADMISSION_QUESTIONNAIRE_CODE,
        version: ADMISSION_QUESTIONNAIRE_VERSION,
        ...(activeOnly ? { isActive: true } : {}),
      },
    });
  }

  async startOrResume(userId: string) {
    const questionnaire = await this.findExpectedQuestionnaire(true);
    if (!questionnaire) throw new AdmissionAttemptError("QUESTIONNAIRE_UNAVAILABLE");
    const key = openAttemptKey(userId, questionnaire.id);

    try {
      return await this.client.$transaction(async (transaction) => {
        const open = await transaction.questionnaireAttempt.findUnique({ where: { openAttemptKey: key } });
        if (open) return open;

        const completed = await transaction.questionnaireAttempt.findFirst({
          where: { userId, questionnaireId: questionnaire.id, status: "COMPLETED" },
          orderBy: { completedAt: "desc" },
        });
        if (completed) return completed;

        return transaction.questionnaireAttempt.create({
          data: {
            questionnaireId: questionnaire.id,
            questionnaireVersion: questionnaire.version,
            userId,
            coupleId: null,
            status: "STARTED",
            completedAt: null,
            totalScore: null,
            openAttemptKey: key,
          },
        });
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
      const winner = await this.client.questionnaireAttempt.findUnique({ where: { openAttemptKey: key } });
      if (winner) return winner;
      throw error;
    }
  }

  async getState(userId: string): Promise<AdmissionAttemptState> {
    const questionnaire = await this.client.questionnaire.findFirst({
      where: { code: ADMISSION_QUESTIONNAIRE_CODE, version: ADMISSION_QUESTIONNAIRE_VERSION },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: { options: { orderBy: { order: "asc" } } },
        },
      },
    });
    if (!questionnaire) return { kind: "NOT_STARTED" };

    const attempt = await this.client.questionnaireAttempt.findFirst({
      where: { userId, questionnaireId: questionnaire.id },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { answers: { select: { questionId: true, optionId: true } } },
    });
    if (!attempt) return { kind: "NOT_STARTED" };
    if (attempt.status === "COMPLETED") return { kind: "COMPLETED", attemptId: attempt.id };

    const questions = questionnaire.questions.map(toAdmissionQuestionDto);
    return {
      kind: "OPEN",
      attemptId: attempt.id,
      status: attempt.status,
      questions,
      answers: attempt.answers,
      currentQuestionIndex: findFirstUnansweredIndex(questions, attempt.answers.map((answer) => answer.questionId)),
    };
  }

  async getStateForAttempt(userId: string, attemptId: string) {
    const ownedAttempt = await this.client.questionnaireAttempt.findFirst({ where: { id: attemptId, userId } });
    if (!ownedAttempt) throw new AdmissionAttemptError("ATTEMPT_NOT_FOUND");
    return this.getState(userId);
  }

  async getSummary(userId: string): Promise<AdmissionAttemptSummary> {
    const questionnaire = await this.findExpectedQuestionnaire();
    if (!questionnaire) return { state: "NOT_STARTED", answerCount: 0, questionCount: ADMISSION_QUESTION_COUNT };
    const attempt = await this.client.questionnaireAttempt.findFirst({
      where: { userId, questionnaireId: questionnaire.id },
      orderBy: { createdAt: "desc" },
      select: { status: true, _count: { select: { answers: true } } },
    });
    if (!attempt) return { state: "NOT_STARTED", answerCount: 0, questionCount: ADMISSION_QUESTION_COUNT };
    return {
      state: attempt.status === "COMPLETED" ? "COMPLETED" : "OPEN",
      answerCount: attempt._count.answers,
      questionCount: ADMISSION_QUESTION_COUNT,
    };
  }

  async saveAnswer(userId: string, attemptId: string, questionId: string, optionId: string) {
    return this.client.$transaction(async (transaction) => {
      const attempt = await transaction.questionnaireAttempt.findFirst({
        where: { id: attemptId, userId },
        include: { questionnaire: { select: { code: true, version: true } } },
      });
      if (!attempt) throw new AdmissionAttemptError("ATTEMPT_NOT_FOUND");
      if (attempt.status === "COMPLETED") throw new AdmissionAttemptError("ATTEMPT_ALREADY_COMPLETED");
      if (
        attempt.questionnaire.code !== ADMISSION_QUESTIONNAIRE_CODE ||
        attempt.questionnaire.version !== ADMISSION_QUESTIONNAIRE_VERSION
      ) throw new AdmissionAttemptError("QUESTION_NOT_IN_ATTEMPT");

      const question = await transaction.question.findFirst({
        where: { id: questionId, questionnaireId: attempt.questionnaireId, isActive: true },
      });
      if (!question) throw new AdmissionAttemptError("QUESTION_NOT_IN_ATTEMPT");
      const option = await transaction.questionOption.findFirst({ where: { id: optionId, questionId } });
      if (!option) throw new AdmissionAttemptError("OPTION_NOT_IN_QUESTION");

      const [orderedQuestions, existingAnswers] = await Promise.all([
        transaction.question.findMany({
          where: { questionnaireId: attempt.questionnaireId, isActive: true },
          orderBy: { order: "asc" },
          select: { id: true },
        }),
        transaction.answer.findMany({ where: { attemptId }, select: { questionId: true } }),
      ]);
      if (!canSaveQuestionInSequence(questionId, orderedQuestions.map(({ id }) => id), existingAnswers.map(({ questionId: id }) => id))) {
        throw new AdmissionAttemptError("OUT_OF_SEQUENCE");
      }

      const score = option.score === null ? null : Number(option.score);
      if ((question.isScored && ![0, 1, 2].includes(score ?? Number.NaN)) || (!question.isScored && score !== null)) {
        throw new AdmissionAttemptError("ANSWER_CONFIGURATION_ERROR");
      }

      const answer = await transaction.answer.upsert({
        where: { attemptId_questionId: { attemptId, questionId } },
        create: { attemptId, questionId, optionId, score, answeredAt: new Date() },
        update: { optionId, score, answeredAt: new Date() },
        select: { id: true, questionId: true, optionId: true },
      });
      await transaction.questionnaireAttempt.update({
        where: { id: attemptId },
        data: { status: "IN_PROGRESS", openAttemptKey: openAttemptKey(userId, attempt.questionnaireId) },
      });
      return answer;
    });
  }

  async complete(userId: string, attemptId: string) {
    return new AdmissionResultService(this.client).completeForUser(userId, attemptId);
  }
}
