import type { CoupleComparisonClassification } from "./couple-comparison";

export type CoupleComparisonReportQuestionDto = {
  questionCode: string;
  text: string;
  area: string;
  areaName: string;
  divergence: 0 | 1 | 2;
  classification: CoupleComparisonClassification;
  classificationLabel: string;
};

export type CoupleComparisonReportAreaDto = {
  area: string;
  name: string;
  description: string;
  narrative: string;
  averageDifference: number;
  questionCount: number;
  convergenceCount: number;
  moderateDivergenceCount: number;
  importantDivergenceCount: number;
  questions: CoupleComparisonReportQuestionDto[];
};

export type CoupleComparisonHighlightDto = Pick<
  CoupleComparisonReportQuestionDto,
  "questionCode" | "text" | "area" | "areaName" | "classification" | "classificationLabel"
>;

export type CoupleComparisonReportDto = {
  questionnaireVersion: string;
  totalQuestions: number;
  summary: {
    convergenceCount: number;
    moderateDivergenceCount: number;
    importantDivergenceCount: number;
  };
  areas: CoupleComparisonReportAreaDto[];
  highlights: {
    alignment: CoupleComparisonHighlightDto[];
    moderateDivergences: CoupleComparisonHighlightDto[];
    importantDivergences: CoupleComparisonHighlightDto[];
  };
};
