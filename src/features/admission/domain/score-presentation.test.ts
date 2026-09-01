import { describe, expect, it } from "vitest";
import {
  convertProblemScoreToRating,
  formatScoreRating,
  getScorePresentation,
} from "./score-presentation";

describe("apresentação da pontuação na escala de 0 a 10", () => {
  it.each([
    [0, 8, 10],
    [1, 8, 8.8],
    [3, 6, 5],
    [4, 8, 5],
    [2, 6, 6.7],
    [1, 4, 7.5],
    [6, 8, 2.5],
  ])("converte %s de %s para %s", (score, maxScore, expected) => {
    expect(convertProblemScoreToRating(score, maxScore)).toBe(expected);
  });

  it("limita dados inconsistentes ao intervalo de 0 a 10", () => {
    expect(convertProblemScoreToRating(-3, 8)).toBe(10);
    expect(convertProblemScoreToRating(12, 8)).toBe(0);
    expect(convertProblemScoreToRating(Number.NaN, 8)).toBe(0);
    expect(convertProblemScoreToRating(2, 0)).toBe(0);
    expect(convertProblemScoreToRating(2, Number.NaN)).toBe(0);
  });

  it.each([
    [0, "PRECISA_MUDAR_COM_URGENCIA"],
    [4.9, "PRECISA_MUDAR_COM_URGENCIA"],
    [5, "PRECISA_MELHORAR"],
    [8.4, "PRECISA_MELHORAR"],
    [8.5, "ESTA_BOM"],
    [10, "ESTA_BOM"],
  ])("classifica a nota %s nos limites definidos", (rating, expected) => {
    expect(getScorePresentation(rating).status).toBe(expected);
  });

  it("formata uma casa decimal com vírgula em português", () => {
    expect(formatScoreRating(8.8)).toBe("8,8");
    expect(formatScoreRating(10)).toBe("10,0");
  });
});
