export const ADMISSION_PRIVATE_QUESTION_CODES = ["P31", "P32", "P33"] as const;
export const ADMISSION_SHAREABLE_QUESTION_CODES = [
  ...Array.from({ length: 30 }, (_, index) => `P${String(index + 1).padStart(2, "0")}`),
  "P39",
  "P40",
] as const;
export const ADMISSION_COMPARISON_QUESTION_CODES = Object.freeze(
  Array.from({ length: 25 }, (_, index) => `P${String(index + 6).padStart(2, "0")}`),
);

export const PRIVATE_ANSWER_POLICY = {
  comparisonEligible: false,
  shareable: false,
  analyticsEligible: false,
  adminBypass: false,
} as const;

export function isPrivateAdmissionQuestion(question: { code: string; isPrivate: boolean }) {
  return question.isPrivate || ADMISSION_PRIVATE_QUESTION_CODES.includes(question.code as typeof ADMISSION_PRIVATE_QUESTION_CODES[number]);
}

export function isShareableAdmissionQuestion(question: { code: string; isPrivate: boolean }) {
  return question.isPrivate === false &&
    ADMISSION_SHAREABLE_QUESTION_CODES.includes(question.code) &&
    !isPrivateAdmissionQuestion(question);
}

export function isComparisonEligibleAdmissionQuestion(question: { code: string; isPrivate: boolean }) {
  return isShareableAdmissionQuestion(question) &&
    ADMISSION_COMPARISON_QUESTION_CODES.includes(question.code);
}

export function canViewPrivateAnswer(viewerUserId: string, ownerUserId: string) {
  return viewerUserId.length > 0 && viewerUserId === ownerUserId;
}

export function assertPrivateAnswerOwnership(viewerUserId: string, ownerUserId: string) {
  if (!canViewPrivateAnswer(viewerUserId, ownerUserId)) throw new PrivateAnswerAccessError("PRIVATE_RESULT_FORBIDDEN");
}

export type PrivateAnswerErrorCode =
  | "PRIVATE_RESULT_FORBIDDEN"
  | "PRIVATE_RESULT_NOT_AVAILABLE"
  | "PRIVATE_SAFETY_CONFIGURATION_ERROR";

export class PrivateAnswerAccessError extends Error {
  constructor(public readonly code: PrivateAnswerErrorCode) {
    super(code);
    this.name = "PrivateAnswerAccessError";
  }
}
