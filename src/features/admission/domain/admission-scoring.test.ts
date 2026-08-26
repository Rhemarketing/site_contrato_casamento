import { describe, expect, it } from "vitest";
import type { AdmissionScoringQuestion } from "@/types/admission-result";
import { ADMISSION_PRIORITY_FLAGS, ADMISSION_SCORE_AREAS } from "./admission-score-config";
import { calculateAdmissionResult, calculateAverageScore, classifyAdmissionScore, classifyArea } from "./admission-scoring";

const areaByCode = new Map<string, string>(ADMISSION_SCORE_AREAS.flatMap((area) => area.questionCodes.map((code) => [code, area.key])));
const scoreByLetter = { A: 0, B: 1, C: 2 } as const;

function buildQuestions(diagnosticLetter: keyof typeof scoreByLetter, neutralLetter: "A" | "C" = "A"): AdmissionScoringQuestion[] {
  return Array.from({ length: 40 }, (_, index) => {
    const code = `P${String(index + 1).padStart(2, "0")}`;
    const isScored = index + 1 >= 6 && index + 1 <= 30;
    const letter = isScored ? diagnosticLetter : neutralLetter;
    const score = isScored ? scoreByLetter[diagnosticLetter] : null;
    const flag = letter === "C" ? ADMISSION_PRIORITY_FLAGS[code as keyof typeof ADMISSION_PRIORITY_FLAGS] ?? null : null;
    return {
      id: `question-${code}`,
      code,
      area: areaByCode.get(code) ?? `neutral-${code}`,
      isScored,
      isPrivate: index + 1 >= 31 && index + 1 <= 33,
      answer: {
        questionId: `question-${code}`,
        optionId: `option-${code}-${letter}`,
        score,
        option: { id: `option-${code}-${letter}`, questionId: `question-${code}`, letter, score, flag },
      },
    };
  });
}

describe("motor puro de resultado da admissão", () => {
  it.each([
    [0, "BOA_BASE_CONJUGAL"], [10, "BOA_BASE_CONJUGAL"],
    [11, "PONTOS_IMPORTANTES_DE_AJUSTE"], [20, "PONTOS_IMPORTANTES_DE_AJUSTE"],
    [21, "SINAIS_SIGNIFICATIVOS_DE_DESGASTE"], [32, "SINAIS_SIGNIFICATIVOS_DE_DESGASTE"],
    [33, "DESCONEXAO_CONJUGAL_ELEVADA"], [41, "DESCONEXAO_CONJUGAL_ELEVADA"],
    [42, "DESGASTE_CONJUGAL_MUITO_ELEVADO"], [50, "DESGASTE_CONJUGAL_MUITO_ELEVADO"],
  ])("classifica o score %i", (score, expected) => expect(classifyAdmissionScore(score)).toBe(expected));

  it("recusa classificação geral fora de 0-50", () => {
    expect(() => classifyAdmissionScore(-1)).toThrow("RESULT_CONFIGURATION_ERROR");
    expect(() => classifyAdmissionScore(51)).toThrow("RESULT_CONFIGURATION_ERROR");
  });

  it("classifica áreas pelas fronteiras inteiras para 3 e 4 perguntas", () => {
    expect(classifyArea(1, 3)).toBe("PONTO_FORTE");
    expect(classifyArea(2, 4)).toBe("PONTO_DE_ATENCAO");
    expect(classifyArea(3, 3)).toBe("PONTO_DE_ATENCAO");
    expect(classifyArea(4, 4)).toBe("PONTO_DE_ATENCAO");
    expect(classifyArea(4, 3)).toBe("AREA_PRIORITARIA");
    expect(classifyArea(5, 4)).toBe("AREA_PRIORITARIA");
  });

  it("arredonda a média em HALF_UP com duas casas", () => {
    expect(calculateAverageScore(1, 3)).toBe("0.33");
    expect(calculateAverageScore(2, 3)).toBe("0.67");
    expect(calculateAverageScore(5, 4)).toBe("1.25");
  });

  it("mantém os máximos oficiais e soma 50", () => {
    expect(ADMISSION_SCORE_AREAS.map(({ key, maxScore }) => [key, maxScore])).toEqual([
      ["comunicacao", 6], ["conflitos_reconciliacao", 6], ["afeto_valorizacao", 6], ["intimidade", 8],
      ["confianca_fidelidade_limites", 6], ["dinheiro_responsabilidades", 6], ["tempo_conexao_futuro", 6],
      ["autopercepcao_disposicao", 4], ["habitos_compulsoes", 2],
    ]);
    expect(ADMISSION_SCORE_AREAS.reduce((sum, area) => sum + area.maxScore, 0)).toBe(50);
  });

  it("calcula todas A sem flags", () => {
    const result = calculateAdmissionResult(buildQuestions("A"));
    expect(result).toMatchObject({ totalScore: 0, classification: "BOA_BASE_CONJUGAL", answerCounts: { A: 25, B: 0, C: 0 }, flags: [] });
    expect(result.areas).toHaveLength(9);
    expect(result.areas.every(({ classification }) => classification === "PONTO_FORTE")).toBe(true);
  });

  it("calcula todas B com média 1", () => {
    const result = calculateAdmissionResult(buildQuestions("B"));
    expect(result).toMatchObject({ totalScore: 25, classification: "SINAIS_SIGNIFICATIVOS_DE_DESGASTE", answerCounts: { A: 0, B: 25, C: 0 }, flags: [] });
    expect(result.areas.every(({ averageScore, classification }) => averageScore === "1.00" && classification === "PONTO_DE_ATENCAO")).toBe(true);
  });

  it("calcula todas C e as quatro flags prioritárias", () => {
    const result = calculateAdmissionResult(buildQuestions("C"));
    expect(result).toMatchObject({ totalScore: 50, classification: "DESGASTE_CONJUGAL_MUITO_ELEVADO", answerCounts: { A: 0, B: 0, C: 25 } });
    expect(result.areas.every(({ classification }) => classification === "AREA_PRIORITARIA")).toBe(true);
    expect(result.flags.map(({ code }) => code)).toEqual(Object.values(ADMISSION_PRIORITY_FLAGS));
  });

  it.each(Object.entries(ADMISSION_PRIORITY_FLAGS))("gera somente a flag cadastrada de %s C", (questionCode, flagCode) => {
    const questions = buildQuestions("A");
    const question = questions.find(({ code }) => code === questionCode)!;
    question.answer!.score = 2;
    question.answer!.option.score = 2;
    question.answer!.option.letter = "C";
    question.answer!.option.flag = flagCode;
    expect(calculateAdmissionResult(questions).flags.map(({ code }) => code)).toEqual([flagCode]);
  });

  it("não gera flags nas alternativas A ou B das perguntas prioritárias", () => {
    expect(calculateAdmissionResult(buildQuestions("A")).flags).toEqual([]);
    expect(calculateAdmissionResult(buildQuestions("B")).flags).toEqual([]);
  });

  it.each([[31, 33], [34, 38], [39, 40]])("mantém resultado idêntico ao variar P%i-P%i", (start, end) => {
    const baseline = buildQuestions("B", "A");
    const changed = buildQuestions("B", "A");
    for (const question of changed.slice(start - 1, end)) {
      question.answer!.option.letter = "C";
      question.answer!.optionId = `${question.answer!.optionId}-changed`;
      question.answer!.option.id = question.answer!.optionId;
    }
    expect(calculateAdmissionResult(changed)).toEqual(calculateAdmissionResult(baseline));
  });

  it("recusa snapshot divergente, score null pontuado e score em pergunta neutra", () => {
    const mismatch = buildQuestions("B");
    mismatch[5].answer!.score = 2;
    expect(() => calculateAdmissionResult(mismatch)).toThrow("RESULT_CONFIGURATION_ERROR");
    const scoredNull = buildQuestions("B");
    scoredNull[5].answer!.score = null;
    scoredNull[5].answer!.option.score = null;
    expect(() => calculateAdmissionResult(scoredNull)).toThrow("RESULT_CONFIGURATION_ERROR");
    const neutralScore = buildQuestions("B");
    neutralScore[0].answer!.score = 1;
    neutralScore[0].answer!.option.score = 1;
    expect(() => calculateAdmissionResult(neutralScore)).toThrow("RESULT_CONFIGURATION_ERROR");
  });

  it("recusa área persistida incompatível", () => {
    const questions = buildQuestions("A");
    questions[5].area = "area_errada";
    expect(() => calculateAdmissionResult(questions)).toThrow("RESULT_CONFIGURATION_ERROR");
  });
});
