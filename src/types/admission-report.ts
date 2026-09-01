import type { AdmissionPrivateSafetyResult } from "./admission-safety";
import type {
  ScorePresentationLevel,
  ScorePresentationStatus,
} from "@/features/admission/domain/score-presentation";

export interface AdmissionScorePresentationDto {
  rating: number;
  ratingMax: 10;
  status: ScorePresentationStatus;
  statusTitle: string;
  statusDescription: string;
  level: ScorePresentationLevel;
}

export interface AdmissionReportAreaDto extends AdmissionScorePresentationDto {
  key: string;
  name: string;
  description: string;
}

export interface AdmissionIndividualReportDto {
  attempt: {
    completedAt: string;
    questionnaireVersion: string;
  };
  general: AdmissionScorePresentationDto;
  answerCounts: {
    satisfactory: number;
    intermediate: number;
    relevantDifficulties: number;
    total: 25;
  };
  areaGroups: {
    urgent: AdmissionReportAreaDto[];
    improvement: AdmissionReportAreaDto[];
    good: AdmissionReportAreaDto[];
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
