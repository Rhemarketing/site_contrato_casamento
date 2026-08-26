import type {
  ADMISSION_AREA_CLASSIFICATIONS,
  ADMISSION_FLAG_SEVERITY,
  ADMISSION_GENERAL_CLASSIFICATIONS,
} from "@/features/admission/domain/admission-score-config";

export type AdmissionGeneralClassification = typeof ADMISSION_GENERAL_CLASSIFICATIONS[keyof typeof ADMISSION_GENERAL_CLASSIFICATIONS];
export type AdmissionAreaClassification = typeof ADMISSION_AREA_CLASSIFICATIONS[keyof typeof ADMISSION_AREA_CLASSIFICATIONS];

export interface AdmissionScoringQuestion {
  id: string;
  code: string;
  area: string;
  isScored: boolean;
  isPrivate: boolean;
  answer: null | {
    questionId: string;
    optionId: string;
    score: number | null;
    option: {
      id: string;
      questionId: string;
      letter: string;
      score: number | null;
      flag: string | null;
    };
  };
}

export interface AdmissionCalculatedResult {
  totalScore: number;
  maxScore: 50;
  classification: AdmissionGeneralClassification;
  answerCounts: { A: number; B: number; C: number };
  areas: Array<{
    area: string;
    score: number;
    maxScore: number;
    averageScore: string;
    classification: AdmissionAreaClassification;
  }>;
  flags: Array<{
    code: string;
    questionId: string;
    questionCode: string;
    severity: typeof ADMISSION_FLAG_SEVERITY;
  }>;
}
