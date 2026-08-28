import { describe, expect, it } from "vitest";
import { ADMISSION_SCORE_AREAS } from "@/features/admission/domain/admission-score-config";
import {
  calculateCoupleComparison,
  classifyDivergence,
  COUPLE_COMPARISON_QUESTION_CODES,
  type CoupleComparisonAnswer,
} from "./couple-comparison";

function answers(score: number): CoupleComparisonAnswer[] {
  return ADMISSION_SCORE_AREAS.flatMap(({ key, questionCodes }) =>
    questionCodes.map((questionCode) => ({ questionCode, area: key, score })),
  );
}

describe("motor puro de comparação do casal", () => {
  it.each([
    [0, "CONVERGENCIA"],
    [1, "DIVERGENCIA_MODERADA"],
    [2, "DIVERGENCIA_IMPORTANTE"],
  ] as const)("classifica divergência %i", (divergence, expected) => {
    expect(classifyDivergence(divergence)).toBe(expected);
  });

  it("compara exatamente as 25 perguntas P06-P30 e as nove áreas", () => {
    const result = calculateCoupleComparison(answers(0), answers(2), "8.0");
    expect(COUPLE_COMPARISON_QUESTION_CODES).toHaveLength(25);
    expect(result.questions).toHaveLength(25);
    expect(result.areas).toHaveLength(9);
    expect(result.questions[0]).toEqual({
      questionCode: "P06",
      area: "comunicacao",
      divergence: 2,
      classification: "DIVERGENCIA_IMPORTANTE",
    });
    expect(result.summary).toEqual({
      convergenceCount: 0,
      moderateDivergenceCount: 0,
      importantDivergenceCount: 25,
    });
    expect(result.areas.every(({ averageDifference }) => averageDifference === 2)).toBe(true);
  });

  it("calcula diferença por média, não por score bruto", () => {
    const personA = answers(0);
    const personB = answers(0);
    for (const answer of personB.filter(({ area }) => area === "intimidade")) answer.score = 1;
    const intimacy = calculateCoupleComparison(personA, personB, "8.0").areas.find(
      ({ area }) => area === "intimidade",
    );
    expect(intimacy).toMatchObject({ questionCount: 4, averageDifference: 1 });
  });

  it.each([
    [0, 0, 0, "CONVERGENCIA"],
    [0, 1, 1, "DIVERGENCIA_MODERADA"],
    [0, 2, 2, "DIVERGENCIA_IMPORTANTE"],
  ] as const)("compara P06 com scores %i e %i", (scoreA, scoreB, divergence, classification) => {
    const personA = answers(0);
    const personB = answers(0);
    personA[0].score = scoreA;
    personB[0].score = scoreB;
    expect(calculateCoupleComparison(personA, personB, "8.0").questions[0]).toMatchObject({
      questionCode: "P06",
      divergence,
      classification,
    });
  });

  it("recusa códigos privados, financeiros, extras, duplicados ou incompletos", () => {
    for (const forbidden of ["P01", "P31", "P33", "P34", "P40"]) {
      const invalid = answers(0);
      invalid[0] = { ...invalid[0], questionCode: forbidden };
      expect(() => calculateCoupleComparison(invalid, answers(0), "8.0")).toThrow(
        "COUPLE_COMPARISON_CONFIGURATION_ERROR",
      );
    }
    expect(() => calculateCoupleComparison(answers(0).slice(1), answers(0), "8.0")).toThrow();
  });
});
