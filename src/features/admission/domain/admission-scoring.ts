import {
  ADMISSION_AREA_CLASSIFICATIONS,
  ADMISSION_FLAG_SEVERITY,
  ADMISSION_GENERAL_CLASSIFICATIONS,
  ADMISSION_MAX_SCORE,
  ADMISSION_PRIORITY_FLAGS,
  ADMISSION_SCORED_QUESTION_CODES,
  ADMISSION_SCORE_AREAS,
} from "./admission-score-config";
import type {
  AdmissionAreaClassification,
  AdmissionCalculatedResult,
  AdmissionGeneralClassification,
  AdmissionScoringQuestion,
} from "@/types/admission-result";

export class AdmissionResultConfigurationError extends Error {
  readonly code = "RESULT_CONFIGURATION_ERROR";

  constructor() {
    super("RESULT_CONFIGURATION_ERROR");
    this.name = "AdmissionResultConfigurationError";
  }
}

function configurationError(): never {
  throw new AdmissionResultConfigurationError();
}

export function classifyAdmissionScore(totalScore: number): AdmissionGeneralClassification {
  if (!Number.isInteger(totalScore) || totalScore < 0 || totalScore > ADMISSION_MAX_SCORE) configurationError();
  if (totalScore <= 10) return ADMISSION_GENERAL_CLASSIFICATIONS.GOOD_BASE;
  if (totalScore <= 20) return ADMISSION_GENERAL_CLASSIFICATIONS.IMPORTANT_ADJUSTMENTS;
  if (totalScore <= 32) return ADMISSION_GENERAL_CLASSIFICATIONS.SIGNIFICANT_WEAR;
  if (totalScore <= 41) return ADMISSION_GENERAL_CLASSIFICATIONS.HIGH_DISCONNECTION;
  return ADMISSION_GENERAL_CLASSIFICATIONS.VERY_HIGH_WEAR;
}

export function classifyArea(score: number, questionCount: number): AdmissionAreaClassification {
  if (!Number.isInteger(score) || !Number.isInteger(questionCount) || questionCount <= 0 || score < 0 || score > questionCount * 2) configurationError();
  if (score * 2 < questionCount) return ADMISSION_AREA_CLASSIFICATIONS.STRENGTH;
  if (score <= questionCount) return ADMISSION_AREA_CLASSIFICATIONS.ATTENTION;
  return ADMISSION_AREA_CLASSIFICATIONS.PRIORITY;
}

export function calculateAverageScore(score: number, questionCount: number) {
  if (!Number.isInteger(score) || !Number.isInteger(questionCount) || questionCount <= 0) configurationError();
  const hundredths = Math.floor((score * 200 + questionCount) / (questionCount * 2));
  return (hundredths / 100).toFixed(2);
}

export function calculateAdmissionResult(questions: AdmissionScoringQuestion[]): AdmissionCalculatedResult {
  if (questions.length !== 40 || new Set(questions.map(({ code }) => code)).size !== 40) configurationError();
  const byCode = new Map(questions.map((question) => [question.code, question]));
  const expectedCodes = Array.from({ length: 40 }, (_, index) => `P${String(index + 1).padStart(2, "0")}`);
  if (expectedCodes.some((code) => !byCode.has(code))) configurationError();

  const scoredCodes = new Set<string>(ADMISSION_SCORED_QUESTION_CODES);
  if (scoredCodes.size !== 25 || questions.filter(({ isScored }) => isScored).length !== 25) configurationError();

  for (const question of questions) {
    const shouldBeScored = scoredCodes.has(question.code);
    if (question.isScored !== shouldBeScored || !question.answer) configurationError();
    const { answer } = question;
    if (answer.questionId !== question.id || answer.optionId !== answer.option.id || answer.option.questionId !== question.id) configurationError();
    if (answer.score !== answer.option.score) configurationError();
    if (shouldBeScored) {
      if (![0, 1, 2].includes(answer.score ?? Number.NaN) || !["A", "B", "C"].includes(answer.option.letter)) configurationError();
    } else if (answer.score !== null || answer.option.score !== null) configurationError();
  }

  const answerCounts = { A: 0, B: 0, C: 0 };
  const areas = ADMISSION_SCORE_AREAS.map((areaConfig) => {
    const areaQuestions = areaConfig.questionCodes.map((code) => byCode.get(code) ?? configurationError());
    if (areaQuestions.some((question) => question.area !== areaConfig.key)) configurationError();
    const score = areaQuestions.reduce((sum, question) => sum + (question.answer?.score ?? configurationError()), 0);
    for (const question of areaQuestions) answerCounts[question.answer?.option.letter as keyof typeof answerCounts] += 1;
    return {
      area: areaConfig.key,
      score,
      maxScore: areaConfig.maxScore,
      averageScore: calculateAverageScore(score, areaQuestions.length),
      classification: classifyArea(score, areaQuestions.length),
    };
  });

  const totalScore = areas.reduce((sum, area) => sum + area.score, 0);
  if (totalScore < 0 || totalScore > ADMISSION_MAX_SCORE) configurationError();
  if (areas.reduce((sum, area) => sum + area.maxScore, 0) !== ADMISSION_MAX_SCORE) configurationError();
  if (answerCounts.A + answerCounts.B + answerCounts.C !== 25) configurationError();

  const flags = Object.entries(ADMISSION_PRIORITY_FLAGS).flatMap(([questionCode, expectedFlag]) => {
    const question = byCode.get(questionCode) ?? configurationError();
    const selectedFlag = question.answer?.option.flag;
    if (selectedFlag === null) return [];
    if (selectedFlag !== expectedFlag || question.answer?.option.letter !== "C") configurationError();
    return [{ code: selectedFlag, questionId: question.id, questionCode, severity: ADMISSION_FLAG_SEVERITY }];
  });

  for (const question of questions.filter(({ code }) => scoredCodes.has(code))) {
    if (question.answer?.option.flag && !Object.hasOwn(ADMISSION_PRIORITY_FLAGS, question.code)) configurationError();
  }

  return { totalScore, maxScore: ADMISSION_MAX_SCORE, classification: classifyAdmissionScore(totalScore), answerCounts, areas, flags };
}
