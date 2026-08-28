import type { CoupleComparisonResultDto } from "@/types/couple-comparison";
import type {
  CoupleComparisonHighlightDto,
  CoupleComparisonReportAreaDto,
  CoupleComparisonReportDto,
  CoupleComparisonReportQuestionDto,
} from "@/types/couple-comparison-report";
import {
  getCoupleComparisonAreaContent,
  getCoupleComparisonAreaNarrative,
  getCoupleComparisonClassificationLabel,
  getCoupleComparisonQuestionText,
} from "./couple-comparison-content";

function toHighlight(question: CoupleComparisonReportQuestionDto): CoupleComparisonHighlightDto {
  return {
    questionCode: question.questionCode,
    text: question.text,
    area: question.area,
    areaName: question.areaName,
    classification: question.classification,
    classificationLabel: question.classificationLabel,
  };
}

export function buildCoupleComparisonReportDto(
  comparison: CoupleComparisonResultDto,
): CoupleComparisonReportDto {
  const areaDifference = new Map(comparison.areas.map(({ area, averageDifference }) => [area, averageDifference]));
  const reportQuestions = comparison.questions.map((question): CoupleComparisonReportQuestionDto => {
    const areaContent = getCoupleComparisonAreaContent(question.area);
    return {
      ...question,
      text: getCoupleComparisonQuestionText(question.questionCode),
      areaName: areaContent.name,
      classificationLabel: getCoupleComparisonClassificationLabel(question.classification),
    };
  });

  const areas: CoupleComparisonReportAreaDto[] = comparison.areas
    .map((area) => {
      const content = getCoupleComparisonAreaContent(area.area);
      return {
        ...area,
        name: content.name,
        description: content.description,
        narrative: getCoupleComparisonAreaNarrative(area),
        questions: reportQuestions.filter(({ area: questionArea }) => questionArea === area.area),
      };
    })
    .sort((areaA, areaB) => areaB.averageDifference - areaA.averageDifference);

  const alignmentAreaOrder = new Map(
    [...areas]
      .sort((areaA, areaB) =>
        areaB.convergenceCount / areaB.questionCount - areaA.convergenceCount / areaA.questionCount ||
        areaA.averageDifference - areaB.averageDifference,
      )
      .map(({ area }, index) => [area, index]),
  );
  const byAlignment = [...reportQuestions].sort(
    (questionA, questionB) =>
      (alignmentAreaOrder.get(questionA.area) ?? 0) - (alignmentAreaOrder.get(questionB.area) ?? 0),
  );
  const byDifference = [...reportQuestions].sort(
    (questionA, questionB) =>
      (areaDifference.get(questionB.area) ?? 0) - (areaDifference.get(questionA.area) ?? 0),
  );

  return {
    questionnaireVersion: comparison.questionnaireVersion,
    totalQuestions: comparison.questionCount,
    summary: { ...comparison.summary },
    areas,
    highlights: {
      alignment: byAlignment.filter(({ classification }) => classification === "CONVERGENCIA").map(toHighlight),
      moderateDivergences: byDifference
        .filter(({ classification }) => classification === "DIVERGENCIA_MODERADA")
        .map(toHighlight),
      importantDivergences: byDifference
        .filter(({ classification }) => classification === "DIVERGENCIA_IMPORTANTE")
        .map(toHighlight),
    },
  };
}
