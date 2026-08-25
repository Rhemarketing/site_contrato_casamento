import { describe, expect, it } from "vitest";
import { admissionQuestionnaireV8 } from "./questionnaire-admission-v8";

const questions = admissionQuestionnaireV8.perguntas;
const byCode = (code: string) => questions.find((question) => question.codigo === code)!;

describe("questionário canônico de admissão 8.0", () => {
  it("possui 40 perguntas, 120 alternativas e códigos P01-P40", () => {
    expect(questions).toHaveLength(40);
    expect(questions.flatMap((question) => question.alternativas)).toHaveLength(120);
    expect(questions.map((question) => question.codigo)).toEqual(Array.from({ length: 40 }, (_, index) => `P${String(index + 1).padStart(2, "0")}`));
  });

  it("possui três alternativas A, B e C em cada pergunta", () => {
    questions.forEach((question) => expect(question.alternativas.map((option) => option.letra)).toEqual(["A", "B", "C"]));
  });

  it("pontua somente P06-P30 com regra 0, 1 e 2", () => {
    expect(questions.filter((question) => question.pontua).map((question) => question.codigo)).toEqual(questions.slice(5, 30).map((question) => question.codigo));
    questions.slice(5, 30).forEach((question) => expect(question.alternativas.map((option) => option.pontuacao)).toEqual([0, 1, 2]));
  });

  it("calcula pontuação máxima igual a 50", () => {
    const maximum = questions.filter((question) => question.pontua).reduce((total, question) => total + Math.max(...question.alternativas.map((option) => option.pontuacao ?? 0)), 0);
    expect(maximum).toBe(50);
  });

  it("usa null em todas as alternativas não pontuadas", () => {
    questions.filter((question) => !question.pontua).forEach((question) => question.alternativas.forEach((option) => expect(option.pontuacao).toBeNull()));
  });

  it("marca somente P31-P33 como privadas", () => {
    expect(questions.filter((question) => question.privada).map((question) => question.codigo)).toEqual(["P31", "P32", "P33"]);
  });

  it("preserva as quatro flags prioritárias", () => {
    const flags = questions.flatMap((question) => question.alternativas.flatMap((option) => option.flag ? [`${question.codigo}.${option.letra}:${option.flag}`] : []));
    expect(flags).toEqual([
      "P18.C:CONVERSA_INTIMIDADE_PRIORITARIA",
      "P21.C:FERIDA_CONFIANCA_PRIORITARIA",
      "P27.C:INSATISFACAO_FUTURO_PRIORITARIA",
      "P30.C:HABITO_COMPULSIVO_PRIORITARIO",
    ]);
  });

  it("preserva os internal codes de segurança", () => {
    expect(["P31", "P32", "P33"].map((code) => byCode(code).alternativas.map((option) => option.codigo_interno))).toEqual([
      ["SAFETY_0", "SAFETY_ATTENTION", "SAFETY_ALERT"],
      ["SAFETY_0", "SAFETY_ATTENTION", "SAFETY_ALERT_HIGH"],
      ["CONSENT_OK", "CONSENT_ATTENTION", "CONSENT_ALERT"],
    ]);
  });
});
