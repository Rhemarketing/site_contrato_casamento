export type CoupleComparisonClassification =
  | "CONVERGENCIA"
  | "DIVERGENCIA_MODERADA"
  | "DIVERGENCIA_IMPORTANTE";

export type CoupleComparisonQuestionDto = {
  questionCode: string;
  area: string;
  divergence: 0 | 1 | 2;
  classification: CoupleComparisonClassification;
};

export type CoupleComparisonAreaDto = {
  area: string;
  questionCount: number;
  averageDifference: number;
  convergenceCount: number;
  moderateDivergenceCount: number;
  importantDivergenceCount: number;
};

export type CoupleComparisonResultDto = {
  questionnaireVersion: string;
  questionCount: 25;
  summary: {
    convergenceCount: number;
    moderateDivergenceCount: number;
    importantDivergenceCount: number;
  };
  questions: CoupleComparisonQuestionDto[];
  areas: CoupleComparisonAreaDto[];
};

export type CoupleComparisonPageDto =
  | { state: "PARTNER_NOT_CONNECTED" }
  | { state: "WAITING_COMPLETION" }
  | { state: "WAITING_OWN_CONSENT" }
  | { state: "WAITING_PARTNER_CONSENT"; canRevoke: true }
  | { state: "AVAILABLE"; canRevoke: true; comparison: CoupleComparisonResultDto };
