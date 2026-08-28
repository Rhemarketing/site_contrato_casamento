import { ADMISSION_SCORE_AREAS } from "@/features/admission/domain/admission-score-config";
import { ADMISSION_COMPARISON_QUESTION_CODES } from "@/features/admission/security/private-answer-policy";
import type {
  CoupleComparisonAreaDto,
  CoupleComparisonClassification,
  CoupleComparisonResultDto,
} from "@/types/couple-comparison";

export type CoupleComparisonAnswer = {
  questionCode: string;
  area: string;
  score: number;
};

export const COUPLE_COMPARISON_QUESTION_CODES = [...ADMISSION_COMPARISON_QUESTION_CODES];
const comparisonQuestionCodeSet = new Set<string>(COUPLE_COMPARISON_QUESTION_CODES);

const expectedAreaByQuestion = new Map<string, string>(
  ADMISSION_SCORE_AREAS.flatMap(({ key, questionCodes }) =>
    questionCodes.map((questionCode) => [questionCode, key] as const),
  ),
);

export class CoupleComparisonConfigurationError extends Error {
  constructor() {
    super("COUPLE_COMPARISON_CONFIGURATION_ERROR");
    this.name = "CoupleComparisonConfigurationError";
  }
}

export function classifyDivergence(divergence: number): CoupleComparisonClassification {
  if (divergence === 0) return "CONVERGENCIA";
  if (divergence === 1) return "DIVERGENCIA_MODERADA";
  if (divergence === 2) return "DIVERGENCIA_IMPORTANTE";
  throw new CoupleComparisonConfigurationError();
}

function normalizeAnswers(answers: CoupleComparisonAnswer[]) {
  if (answers.length !== COUPLE_COMPARISON_QUESTION_CODES.length) {
    throw new CoupleComparisonConfigurationError();
  }

  const byCode = new Map<string, CoupleComparisonAnswer>();
  for (const answer of answers) {
    const expectedArea = expectedAreaByQuestion.get(answer.questionCode);
    if (
      !expectedArea ||
      expectedArea !== answer.area ||
      !Number.isInteger(answer.score) ||
      answer.score < 0 ||
      answer.score > 2 ||
      byCode.has(answer.questionCode)
    ) {
      throw new CoupleComparisonConfigurationError();
    }
    byCode.set(answer.questionCode, answer);
  }

  if (
    byCode.size !== comparisonQuestionCodeSet.size ||
    COUPLE_COMPARISON_QUESTION_CODES.some((code) => !byCode.has(code))
  ) {
    throw new CoupleComparisonConfigurationError();
  }
  return byCode;
}

function countClassifications(classifications: CoupleComparisonClassification[]) {
  return {
    convergenceCount: classifications.filter((value) => value === "CONVERGENCIA").length,
    moderateDivergenceCount: classifications.filter((value) => value === "DIVERGENCIA_MODERADA").length,
    importantDivergenceCount: classifications.filter((value) => value === "DIVERGENCIA_IMPORTANTE").length,
  };
}

export function calculateCoupleComparison(
  personAAnswers: CoupleComparisonAnswer[],
  personBAnswers: CoupleComparisonAnswer[],
  questionnaireVersion: string,
): CoupleComparisonResultDto {
  const personA = normalizeAnswers(personAAnswers);
  const personB = normalizeAnswers(personBAnswers);

  const questions = COUPLE_COMPARISON_QUESTION_CODES.map((questionCode) => {
    const answerA = personA.get(questionCode)!;
    const answerB = personB.get(questionCode)!;
    const divergence = Math.abs(answerA.score - answerB.score) as 0 | 1 | 2;
    return {
      questionCode,
      area: answerA.area,
      divergence,
      classification: classifyDivergence(divergence),
    };
  });

  const areas: CoupleComparisonAreaDto[] = ADMISSION_SCORE_AREAS.map(({ key, questionCodes }) => {
    const areaQuestionCodeSet = new Set<string>(questionCodes);
    const personAScore = questionCodes.reduce((sum, code) => sum + personA.get(code)!.score, 0);
    const personBScore = questionCodes.reduce((sum, code) => sum + personB.get(code)!.score, 0);
    const areaQuestions = questions.filter(({ questionCode }) => areaQuestionCodeSet.has(questionCode));
    return {
      area: key,
      questionCount: questionCodes.length,
      averageDifference: Number(
        Math.abs(personAScore / questionCodes.length - personBScore / questionCodes.length).toFixed(2),
      ),
      ...countClassifications(areaQuestions.map(({ classification }) => classification)),
    };
  });

  return {
    questionnaireVersion,
    questionCount: 25,
    summary: countClassifications(questions.map(({ classification }) => classification)),
    questions,
    areas,
  };
}
