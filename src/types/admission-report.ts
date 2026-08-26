import type { AdmissionPrivateSafetyResult } from "./admission-safety";

export interface AdmissionReportAreaDto {
  key: string;
  name: string;
  description: string;
  score: number;
  maxScore: number;
  averageScore: string;
  classification: "PONTO_FORTE" | "PONTO_DE_ATENCAO" | "AREA_PRIORITARIA";
  classificationTitle: string;
  classificationSummary: string;
}

export interface AdmissionIndividualReportDto {
  attempt: {
    completedAt: string;
    questionnaireVersion: string;
  };
  general: {
    totalScore: number;
    maxScore: 50;
    classification: string;
    title: string;
    summary: string;
    recommendation: string;
  };
  answerCounts: {
    satisfactory: number;
    intermediate: number;
    relevantDifficulties: number;
    total: 25;
  };
  areaGroups: {
    strengths: AdmissionReportAreaDto[];
    attention: AdmissionReportAreaDto[];
    priorities: AdmissionReportAreaDto[];
  };
  flags: Array<{
    code: string;
    title: string;
    description: string;
    recommendation: string | null;
  }>;
  safety: AdmissionPrivateSafetyResult | null;
}

export type AdmissionIndividualReportState =
  | { kind: "NOT_STARTED" }
  | { kind: "IN_PROGRESS"; answerCount: number }
  | { kind: "RESULT_PENDING" }
  | { kind: "READY"; report: AdmissionIndividualReportDto };
