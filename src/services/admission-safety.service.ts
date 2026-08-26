import type { PrismaClient } from "@/generated/prisma/client";
import { ADMISSION_QUESTIONNAIRE_CODE, ADMISSION_QUESTIONNAIRE_VERSION } from "@/config/admission-questionnaire";
import { calculateAdmissionSafety } from "@/features/admission/security/admission-safety";
import {
  ADMISSION_PRIVATE_QUESTION_CODES,
  ADMISSION_SHAREABLE_QUESTION_CODES,
  assertPrivateAnswerOwnership,
  PrivateAnswerAccessError,
} from "@/features/admission/security/private-answer-policy";
import type { AdmissionSafetyInput, ShareableAdmissionAnswerDto } from "@/types/admission-safety";

export class AdmissionSafetyService {
  constructor(private readonly client: PrismaClient) {}

  async getPrivateSafetyResultForUser(userId: string, attemptId?: string) {
    const attempt = await this.client.questionnaireAttempt.findFirst({
      where: {
        ...(attemptId ? { id: attemptId } : {}),
        userId,
        status: "COMPLETED",
        questionnaire: { code: ADMISSION_QUESTIONNAIRE_CODE, version: ADMISSION_QUESTIONNAIRE_VERSION },
      },
      orderBy: { completedAt: "desc" },
      select: { id: true, userId: true, questionnaireId: true },
    });
    if (!attempt) throw new PrivateAnswerAccessError(attemptId ? "PRIVATE_RESULT_FORBIDDEN" : "PRIVATE_RESULT_NOT_AVAILABLE");
    assertPrivateAnswerOwnership(userId, attempt.userId);

    const questions = await this.client.question.findMany({
      where: { questionnaireId: attempt.questionnaireId, isActive: true },
      orderBy: { order: "asc" },
      select: {
        code: true,
        isPrivate: true,
        isScored: true,
        answers: {
          where: { attemptId: attempt.id },
          select: {
            score: true,
            option: { select: { score: true, internalCode: true } },
          },
        },
      },
    });
    const privateCodes = questions.filter(({ isPrivate }) => isPrivate).map(({ code }) => code).sort();
    if (JSON.stringify(privateCodes) !== JSON.stringify([...ADMISSION_PRIVATE_QUESTION_CODES])) {
      throw new PrivateAnswerAccessError("PRIVATE_SAFETY_CONFIGURATION_ERROR");
    }

    const inputs = questions
      .filter(({ code }) => ADMISSION_PRIVATE_QUESTION_CODES.includes(code as typeof ADMISSION_PRIVATE_QUESTION_CODES[number]))
      .map((question): AdmissionSafetyInput => {
        if (question.answers.length !== 1) throw new PrivateAnswerAccessError("PRIVATE_SAFETY_CONFIGURATION_ERROR");
        const answer = question.answers[0];
        return {
          questionCode: question.code,
          isPrivate: question.isPrivate,
          isScored: question.isScored,
          answerScore: answer.score === null ? null : Number(answer.score),
          optionScore: answer.option.score === null ? null : Number(answer.option.score),
          internalCode: answer.option.internalCode,
        };
      });
    return calculateAdmissionSafety(inputs);
  }

  async getShareableAnswersForOwner(userId: string, attemptId: string): Promise<ShareableAdmissionAnswerDto[]> {
    const attempt = await this.client.questionnaireAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        questionnaire: { code: ADMISSION_QUESTIONNAIRE_CODE, version: ADMISSION_QUESTIONNAIRE_VERSION },
      },
      select: { id: true },
    });
    if (!attempt) throw new PrivateAnswerAccessError("PRIVATE_RESULT_FORBIDDEN");

    const answers = await this.client.answer.findMany({
      where: {
        attemptId: attempt.id,
        question: {
          isPrivate: false,
          code: { in: [...ADMISSION_SHAREABLE_QUESTION_CODES] },
        },
      },
      orderBy: { question: { order: "asc" } },
      select: {
        question: { select: { code: true, isPrivate: true } },
        option: { select: { letter: true } },
      },
    });
    return answers.map(({ question, option }) => {
      if (question.isPrivate || !ADMISSION_SHAREABLE_QUESTION_CODES.includes(question.code)) {
        throw new PrivateAnswerAccessError("PRIVATE_SAFETY_CONFIGURATION_ERROR");
      }
      return { questionCode: question.code, optionLetter: option.letter };
    });
  }
}
