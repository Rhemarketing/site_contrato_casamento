import { ADMISSION_MAX_SCORE } from "@/features/admission/domain/admission-score-config";
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
  const byAverageDescending = (left: AdmissionReportAreaDto, right: AdmissionReportAreaDto) =>
    Number(right.averageScore) - Number(left.averageScore) || byOfficialOrder(left, right);
  return {
    strengths: areas.filter(({ classification }) => classification === "PONTO_FORTE").sort(byOfficialOrder),
    attention: areas.filter(({ classification }) => classification === "PONTO_DE_ATENCAO").sort(byAverageDescending),
    priorities: areas.filter(({ classification }) => classification === "AREA_PRIORITARIA").sort(byAverageDescending),
  };
}

export function buildAdmissionIndividualReportDto(input: BuildReportInput): AdmissionIndividualReportDto {
  const { result } = input;
  if (!Number.isInteger(result.totalScore) || result.totalScore < 0 || result.totalScore > ADMISSION_MAX_SCORE || result.maxScore !== ADMISSION_MAX_SCORE) {
    throw new AdmissionReportConfigurationError();
  }
  const generalContent = getGeneralReportContent(result.classification);
  const areas = result.areas.map((area): AdmissionReportAreaDto => {
    const content = getAreaReportContent(area.area);
    const classificationContent = getAreaClassificationContent(area.classification);
    return {
      key: area.area,
      name: content.name,
      description: content.description,
      score: area.score,
      maxScore: area.maxScore,
      averageScore: area.averageScore,
      classification: area.classification,
      classificationTitle: classificationContent.title,
      classificationSummary: classificationContent.summary,
    };
  });
  const totalAnswers = result.answerCounts.A + result.answerCounts.B + result.answerCounts.C;
  if (totalAnswers !== 25) throw new AdmissionReportConfigurationError();
  if (result.flags.length > 4 || new Set(result.flags.map(({ code }) => code)).size !== result.flags.length) {
    throw new AdmissionReportConfigurationError();
  }
  return {
    attempt: { completedAt: input.completedAt.toISOString(), questionnaireVersion: input.questionnaireVersion },
    general: {
      totalScore: result.totalScore,
      maxScore: ADMISSION_MAX_SCORE,
      classification: result.classification,
      title: generalContent.title,
      summary: generalContent.summary,
      recommendation: generalContent.recommendation,
    },
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
