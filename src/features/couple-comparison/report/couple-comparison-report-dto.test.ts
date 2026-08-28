import { describe, expect, it } from "vitest";
import { ADMISSION_SCORE_AREAS } from "@/features/admission/domain/admission-score-config";
import {
  calculateCoupleComparison,
  type CoupleComparisonAnswer,
} from "@/features/couple-comparison/domain/couple-comparison";
import { buildCoupleComparisonReportDto } from "./couple-comparison-report-dto";

function answers(score = 0): CoupleComparisonAnswer[] {
  return ADMISSION_SCORE_AREAS.flatMap(({ key, questionCodes }) =>
    questionCodes.map((questionCode) => ({ questionCode, area: key, score })),
  );
}

function mixedReport() {
  const personA = answers();
  const personB = answers();
  for (const [code, score] of [["P06", 2], ["P07", 1], ["P09", 1], ["P30", 2]] as const) {
    personB.find(({ questionCode }) => questionCode === code)!.score = score;
  }
  return buildCoupleComparisonReportDto(calculateCoupleComparison(personA, personB, "8.0"));
}

function collectKeys(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(collectKeys);
  return Object.entries(value).flatMap(([key, nestedValue]) => [key, ...collectKeys(nestedValue)]);
}

describe("DTO de apresentação do relatório do casal", () => {
  it("apresenta 25 perguntas públicas distribuídas nas nove áreas", () => {
    const report = mixedReport();
    expect(report.totalQuestions).toBe(25);
    expect(report.areas).toHaveLength(9);
    expect(report.areas.flatMap(({ questions }) => questions)).toHaveLength(25);
    expect(report.areas.flatMap(({ questions }) => questions).map(({ questionCode }) => questionCode).sort()).toEqual(
      Array.from({ length: 25 }, (_, index) => `P${String(index + 6).padStart(2, "0")}`),
    );
  });

  it("preserva as contagens gerais de divergência 0, 1 e 2", () => {
    expect(mixedReport().summary).toEqual({
      convergenceCount: 21,
      moderateDivergenceCount: 2,
      importantDivergenceCount: 2,
    });
  });

  it("ordena áreas pela diferença média decrescente sem criar classificação nova", () => {
    const report = mixedReport();
    expect(report.areas.slice(0, 3).map(({ area }) => area)).toEqual([
      "habitos_compulsoes",
      "comunicacao",
      "conflitos_reconciliacao",
    ]);
    expect(report.areas.map(({ averageDifference }) => averageDifference)).toEqual(
      [...report.areas.map(({ averageDifference }) => averageDifference)].sort((a, b) => b - a),
    );
    expect(report.areas.every((area) => !("classification" in area))).toBe(true);
  });

  it("deriva narrativas somente das classificações já calculadas", () => {
    const report = mixedReport();
    expect(report.areas.find(({ area }) => area === "comunicacao")?.narrative).toContain("diferenças importantes");
    expect(report.areas.find(({ area }) => area === "conflitos_reconciliacao")?.narrative).toContain("algumas diferenças");
    expect(report.areas.find(({ area }) => area === "afeto_valorizacao")?.narrative).toContain("bastante semelhante");
  });

  it("cria destaques de alinhamento, diferenças moderadas e importantes", () => {
    const highlights = mixedReport().highlights;
    expect(highlights.alignment).toHaveLength(21);
    expect(highlights.moderateDivergences.map(({ questionCode }) => questionCode).sort()).toEqual(["P07", "P09"]);
    expect(highlights.importantDivergences.map(({ questionCode }) => questionCode).sort()).toEqual(["P06", "P30"]);
  });

  it("usa o texto canônico das perguntas sem alternativas ou respostas individuais", () => {
    const question = mixedReport().areas.flatMap(({ questions }) => questions).find(({ questionCode }) => questionCode === "P06");
    expect(question?.text).toBe("Quando você fala sobre algo que realmente importa para você, sente que seu cônjuge procura entender o que você está dizendo antes de responder?");
    expect(question).toMatchObject({ classificationLabel: "Diferença importante de percepção" });
  });

  it("mantém o DTO sanitizado e exclui completamente códigos fora de P06-P30", () => {
    const report = mixedReport();
    const keys = collectKeys(report);
    expect(keys).not.toEqual(expect.arrayContaining([
      "answer", "answers", "answerId", "optionId", "internalCode", "score", "individualScore",
      "userId", "coupleId", "attemptId", "safety", "financialProfile", "resultFlag",
    ]));
    expect(JSON.stringify(report)).not.toMatch(/"questionCode":"P(?:0[1-5]|3[1-9]|40)"/);
  });

  it("não força divergências quando todas as percepções são semelhantes", () => {
    const report = buildCoupleComparisonReportDto(calculateCoupleComparison(answers(), answers(), "8.0"));
    expect(report.highlights.alignment).toHaveLength(25);
    expect(report.highlights.moderateDivergences).toHaveLength(0);
    expect(report.highlights.importantDivergences).toHaveLength(0);
  });
});
