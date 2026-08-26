import { ADMISSION_PRIVATE_QUESTION_CODES, PrivateAnswerAccessError } from "./private-answer-policy";
import type { AdmissionPrivateSafetyResult, AdmissionSafetyInput, AdmissionSafetyLevel } from "@/types/admission-safety";

const SAFETY_CODE_LEVELS = {
  SAFETY_0: "NONE",
  CONSENT_OK: "NONE",
  SAFETY_ATTENTION: "ATTENTION",
  CONSENT_ATTENTION: "ATTENTION",
  SAFETY_ALERT: "ALERT",
  CONSENT_ALERT: "ALERT",
  SAFETY_ALERT_HIGH: "HIGH_ALERT",
} as const satisfies Record<string, AdmissionSafetyLevel>;

const EXPECTED_CODES = {
  P31: ["SAFETY_0", "SAFETY_ATTENTION", "SAFETY_ALERT"],
  P32: ["SAFETY_0", "SAFETY_ATTENTION", "SAFETY_ALERT_HIGH"],
  P33: ["CONSENT_OK", "CONSENT_ATTENTION", "CONSENT_ALERT"],
} as const;

const LEVEL_RANK: Record<AdmissionSafetyLevel, number> = { NONE: 0, ATTENTION: 1, ALERT: 2, HIGH_ALERT: 3 };

function configurationError(): never {
  throw new PrivateAnswerAccessError("PRIVATE_SAFETY_CONFIGURATION_ERROR");
}

export function mapSafetyInternalCode(internalCode: string): AdmissionSafetyLevel {
  return SAFETY_CODE_LEVELS[internalCode as keyof typeof SAFETY_CODE_LEVELS] ?? configurationError();
}

export function calculateAdmissionSafety(inputs: AdmissionSafetyInput[]): AdmissionPrivateSafetyResult {
  if (inputs.length !== 3 || new Set(inputs.map(({ questionCode }) => questionCode)).size !== 3) configurationError();
  const byCode = new Map(inputs.map((input) => [input.questionCode, input]));
  if (ADMISSION_PRIVATE_QUESTION_CODES.some((code) => !byCode.has(code))) configurationError();
  if (inputs.some(({ questionCode }) => !ADMISSION_PRIVATE_QUESTION_CODES.includes(questionCode as typeof ADMISSION_PRIVATE_QUESTION_CODES[number]))) configurationError();

  const items = ADMISSION_PRIVATE_QUESTION_CODES.map((questionCode) => {
    const input = byCode.get(questionCode) ?? configurationError();
    if (!input.isPrivate || input.isScored || input.answerScore !== null || input.optionScore !== null || !input.internalCode) configurationError();
    if (!EXPECTED_CODES[questionCode].includes(input.internalCode as never)) configurationError();
    return { questionCode, level: mapSafetyInternalCode(input.internalCode) };
  });
  const overallLevel = items.reduce<AdmissionSafetyLevel>(
    (highest, item) => LEVEL_RANK[item.level] > LEVEL_RANK[highest] ? item.level : highest,
    "NONE",
  );
  return { overallLevel, items };
}
