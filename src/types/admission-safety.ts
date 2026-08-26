export type AdmissionSafetyLevel = "NONE" | "ATTENTION" | "ALERT" | "HIGH_ALERT";

export interface AdmissionSafetyInput {
  questionCode: string;
  isPrivate: boolean;
  isScored: boolean;
  answerScore: number | null;
  optionScore: number | null;
  internalCode: string | null;
}

export interface AdmissionPrivateSafetyResult {
  overallLevel: AdmissionSafetyLevel;
  items: Array<{
    questionCode: "P31" | "P32" | "P33";
    level: AdmissionSafetyLevel;
  }>;
}

export interface ShareableAdmissionAnswerDto {
  questionCode: string;
  optionLetter: string;
}
