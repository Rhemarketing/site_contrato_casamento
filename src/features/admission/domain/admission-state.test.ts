import { describe, expect, it } from "vitest";
import {
  calculateQuestionProgress,
  canContinueQuestion,
  canSaveQuestionInSequence,
  findFirstUnansweredIndex,
  getAdmissionStageTitle,
  toAdmissionQuestionDto,
} from "./admission-state";

const persistedQuestion = {
  id: "question-1",
  code: "P01",
  order: 1,
  stage: "perfil",
  area: "identidade",
  text: "Pergunta",
  description: null,
  isPrivate: false,
  isScored: false,
  options: [{ id: "option-1", letter: "A", text: "Alternativa", score: null, flag: "SECRET", internalCode: "PRIVATE" }],
};

describe("estado da Prova de Admissão", () => {
  it("mapeia somente os campos públicos do DTO", () => {
    expect(toAdmissionQuestionDto(persistedQuestion)).toEqual({
      id: "question-1", code: "P01", order: 1, stage: "perfil", area: "identidade", text: "Pergunta", description: null,
      options: [{ id: "option-1", letter: "A", text: "Alternativa" }],
    });
  });

  it("não serializa score, flag ou internalCode", () => {
    const serialized = JSON.stringify(toAdmissionQuestionDto(persistedQuestion));
    expect(serialized).not.toContain("score");
    expect(serialized).not.toContain("flag");
    expect(serialized).not.toContain("internalCode");
    expect(serialized).not.toContain("SECRET");
  });

  it("encontra a primeira pergunta não respondida", () => {
    expect(findFirstUnansweredIndex([{ id: "P01" }, { id: "P02" }, { id: "P03" }], ["P01", "P02"])).toBe(2);
    expect(findFirstUnansweredIndex([{ id: "P01" }], ["P01"])).toBe(0);
  });

  it("calcula progresso pela posição da pergunta", () => {
    expect(calculateQuestionProgress(0, 40)).toBe(3);
    expect(calculateQuestionProgress(39, 40)).toBe(100);
    expect(calculateQuestionProgress(0, 0)).toBe(0);
  });

  it("permite pergunta nova somente na primeira lacuna e permite edição", () => {
    const ordered = ["P01", "P02", "P03"];
    expect(canSaveQuestionInSequence("P02", ordered, ["P01"])).toBe(true);
    expect(canSaveQuestionInSequence("P03", ordered, ["P01"])).toBe(false);
    expect(canSaveQuestionInSequence("P01", ordered, ["P01"])).toBe(true);
  });

  it("traduz todos os títulos técnicos das etapas", () => {
    expect(["perfil", "diagnostico", "seguranca", "financeiro", "motivacao"].map(getAdmissionStageTitle)).toEqual([
      "Conhecendo seu relacionamento", "Como está o seu casamento?", "Segurança, respeito e consentimento", "Realidade financeira", "O relacionamento que você deseja construir",
    ]);
  });

  it("habilita Continuar apenas após persistência e fora do autosave", () => {
    expect(canContinueQuestion("P01", ["P01"], false)).toBe(true);
    expect(canContinueQuestion("P01", [], false)).toBe(false);
    expect(canContinueQuestion("P01", ["P01"], true)).toBe(false);
  });
});
