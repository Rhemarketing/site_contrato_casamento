import type { PrismaClient } from "@/generated/prisma/client";
import { ADMISSION_QUESTIONNAIRE_CODE, ADMISSION_QUESTIONNAIRE_VERSION } from "@/config/admission-questionnaire";
import {
  ADMISSION_FINANCIAL_QUESTION_CODES,
  AdmissionFinancialProfileError,
  buildAdmissionFinancialProfile,
  toAdmissionFinancialProfileDto,
} from "@/features/admission/financial/admission-financial-profile";
import type { AdmissionFinancialProfileDto, AdmissionFinancialProfileInput } from "@/types/admission-financial";

type GetFinancialProfileForOwnerInput = {
  attemptId: string;
  userId: string;
};

export class AdmissionFinancialProfileService {
  constructor(private readonly client: PrismaClient) {}

  async getFinancialProfileForOwner({
    attemptId,
    userId,
  }: GetFinancialProfileForOwnerInput): Promise<AdmissionFinancialProfileDto> {
    const attempt = await this.client.questionnaireAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        status: "COMPLETED",
        questionnaire: {
          code: ADMISSION_QUESTIONNAIRE_CODE,
          version: ADMISSION_QUESTIONNAIRE_VERSION,
        },
      },
      select: {
        answers: {
          where: { question: { code: { in: [...ADMISSION_FINANCIAL_QUESTION_CODES] } } },
          orderBy: { question: { order: "asc" } },
          select: {
            score: true,
            question: { select: { code: true, isPrivate: true, isScored: true } },
            option: { select: { internalCode: true, score: true } },
          },
        },
      },
    });

    if (!attempt) throw new AdmissionFinancialProfileError("FINANCIAL_PROFILE_FORBIDDEN");

    const inputs = attempt.answers.map(({ question, option, score }): AdmissionFinancialProfileInput => ({
      questionCode: question.code,
      isPrivate: question.isPrivate,
      isScored: question.isScored,
      answerScore: score === null ? null : Number(score),
      optionScore: option.score === null ? null : Number(option.score),
      internalCode: option.internalCode,
    }));

    return toAdmissionFinancialProfileDto(buildAdmissionFinancialProfile(inputs));
  }
}
