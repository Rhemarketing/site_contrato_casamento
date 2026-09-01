import { ADMISSION_MAX_SCORE } from "@/features/admission/domain/admission-score-config";
import {
  convertProblemScoreToRating,
  getScorePresentation,
  SCORE_PRESENTATION_MAX,
} from "@/features/admission/domain/score-presentation";
import type { AdmissionCalculatedResult } from "@/types/admission-result";
import type { AdmissionIndividualReportDto, AdmissionReportAreaDto } from "@/types/admission-report";
import type { AdmissionPrivateSafetyResult } from "@/types/admission-safety";
import {
  AdmissionReportConfigurationError,
  AREA_REPORT_ORDER,
  getAreaClassificationContent,
  getAreaReportContent,
  getGeneralReportContent,
  getPriorityFlagContent,
} from "./admission-report-content";

interface BuildReportInput {
  completedAt: Date;
  questionnaireVersion: string;
  result: AdmissionCalculatedResult;
  safety: AdmissionPrivateSafetyResult;
}

function areaOrder(key: string) {
  const index = AREA_REPORT_ORDER.indexOf(key as typeof AREA_REPORT_ORDER[number]);
  if (index === -1) throw new AdmissionReportConfigurationError();
  return index;
}

export function groupAdmissionReportAreas(areas: AdmissionReportAreaDto[]) {
  if (areas.length !== 9 || new Set(areas.map(({ key }) => key)).size !== 9) throw new AdmissionReportConfigurationError();
  if (areas.some(({ key }) => !AREA_REPORT_ORDER.includes(key as typeof AREA_REPORT_ORDER[number]))) throw new AdmissionReportConfigurationError();
  const byOfficialOrder = (left: AdmissionReportAreaDto, right: AdmissionReportAreaDto) => areaOrder(left.key) - areaOrder(right.key);
  const byRatingAscending = (left: AdmissionReportAreaDto, right: AdmissionReportAreaDto) =>
    left.rating - right.rating || byOfficialOrder(left, right);
  return {
    urgent: areas.filter(({ status }) => status === "PRECISA_MUDAR_COM_URGENCIA").sort(byRatingAscending),
    improvement: areas.filter(({ status }) => status === "PRECISA_MELHORAR").sort(byRatingAscending),
    good: areas.filter(({ status }) => status === "ESTA_BOM").sort(byOfficialOrder),
  };
}

function scorePresentation(score: number, maxScore: number, scope: "area" | "general" = "area") {
  const rating = convertProblemScoreToRating(score, maxScore);
  const presentation = getScorePresentation(rating);
  return {
    rating,
    ratingMax: SCORE_PRESENTATION_MAX,
    status: presentation.status,
    statusTitle: presentation.title,
    statusDescription: scope === "general" ? presentation.generalDescription : presentation.description,
    level: presentation.level,
  } as const;
}

export function buildAdmissionIndividualReportDto(input: BuildReportInput): AdmissionIndividualReportDto {
  const { result } = input;
  if (!Number.isInteger(result.totalScore) || result.totalScore < 0 || result.totalScore > ADMISSION_MAX_SCORE || result.maxScore !== ADMISSION_MAX_SCORE) {
    throw new AdmissionReportConfigurationError();
  }
  getGeneralReportContent(result.classification);
  const areas = result.areas.map((area): AdmissionReportAreaDto => {
    const content = getAreaReportContent(area.area);
    getAreaClassificationContent(area.classification);
    return {
      key: area.area,
      name: content.name,
      description: content.description,
      ...scorePresentation(area.score, area.maxScore),
    };
  });
  const totalAnswers = result.answerCounts.A + result.answerCounts.B + result.answerCounts.C;
  if (totalAnswers !== 25) throw new AdmissionReportConfigurationError();
  if (result.flags.length > 4 || new Set(result.flags.map(({ code }) => code)).size !== result.flags.length) {
    throw new AdmissionReportConfigurationError();
  }
  return {
    attempt: { completedAt: input.completedAt.toISOString(), questionnaireVersion: input.questionnaireVersion },
    general: scorePresentation(result.totalScore, ADMISSION_MAX_SCORE, "general"),
    answerCounts: {
      satisfactory: result.answerCounts.A,
      intermediate: result.answerCounts.B,
      relevantDifficulties: result.answerCounts.C,
      total: 25,
    },
    areaGroups: groupAdmissionReportAreas(areas),
    flags: result.flags.map(({ code }) => ({ code, ...getPriorityFlagContent(code) })),
    safety: input.safety.overallLevel === "NONE" ? null : input.safety,
  };
}
