import { describe, expect, it } from "vitest";
import type { AdmissionFinancialProfileInput } from "@/types/admission-financial";
import {
  buildAdmissionFinancialProfile,
  mapDebtStatus,
  mapHousingStatus,
  mapIncomeBand,
  mapInvestmentCapacity,
  mapMonthlyMargin,
  toAdmissionFinancialProfileDto,
} from "./admission-financial-profile";

const internalCodes = {
  P34: "MORADIA_PROPRIA_QUITADA",
  P35: "RENDA_ACIMA_10000",
  P36: "MARGEM_POSITIVA",
  P37: "DIVIDA_CONTROLADA",
  P38: "CAPACIDADE_INTEGRAL",
} as const;

function buildInputs(overrides: Partial<Record<keyof typeof internalCodes, string | null>> = {}): AdmissionFinancialProfileInput[] {
  return Object.entries({ ...internalCodes, ...overrides }).map(([questionCode, internalCode]) => ({
    questionCode,
    isPrivate: false,
    isScored: false,
    answerScore: null,
    optionScore: null,
    internalCode,
  }));
}

describe("perfil financeiro puro da admissão", () => {
  it.each([
    ["MORADIA_PROPRIA_QUITADA", "OWNED_PAID"],
    ["MORADIA_FINANCIADA", "OWNED_FINANCED"],
    ["MORADIA_ALUGUEL_OUTRA", "RENTED_OR_OTHER"],
  ])("mapeia moradia %s", (internalCode, expected) => expect(mapHousingStatus(internalCode)).toBe(expected));

  it.each([
    ["RENDA_ATE_5000", "UP_TO_5000"],
    ["RENDA_5001_10000", "FROM_5001_TO_10000"],
    ["RENDA_ACIMA_10000", "ABOVE_10000"],
  ])("mapeia renda %s", (internalCode, expected) => expect(mapIncomeBand(internalCode)).toBe(expected));

  it.each([
    ["MARGEM_POSITIVA", "POSITIVE"],
    ["MARGEM_APERTADA", "TIGHT"],
    ["MARGEM_NEGATIVA", "NEGATIVE"],
  ])("mapeia margem %s", (internalCode, expected) => expect(mapMonthlyMargin(internalCode)).toBe(expected));

  it.each([
    ["DIVIDA_CONTROLADA", "CONTROLLED"],
    ["DIVIDA_ATENCAO", "ATTENTION"],
    ["VULNERABILIDADE_FINANCEIRA", "FINANCIAL_VULNERABILITY"],
  ])("mapeia dívidas %s", (internalCode, expected) => expect(mapDebtStatus(internalCode)).toBe(expected));

  it.each([
    ["CAPACIDADE_INTEGRAL", "FULL"],
    ["CAPACIDADE_PARCELADA", "INSTALLMENTS"],
    ["SEM_CAPACIDADE_ATUAL", "NONE_CURRENTLY"],
  ])("mapeia capacidade %s", (internalCode, expected) => expect(mapInvestmentCapacity(internalCode)).toBe(expected));

  it.each([
    [
      {},
      {
        housing: "OWNED_PAID",
        incomeBand: "ABOVE_10000",
        monthlyMargin: "POSITIVE",
        debtStatus: "CONTROLLED",
        investmentCapacity: "FULL",
      },
    ],
    [
      {
        P34: "MORADIA_FINANCIADA",
        P35: "RENDA_5001_10000",
        P36: "MARGEM_APERTADA",
        P37: "DIVIDA_ATENCAO",
        P38: "CAPACIDADE_PARCELADA",
      },
      {
        housing: "OWNED_FINANCED",
        incomeBand: "FROM_5001_TO_10000",
        monthlyMargin: "TIGHT",
        debtStatus: "ATTENTION",
        investmentCapacity: "INSTALLMENTS",
      },
    ],
    [
      {
        P34: "MORADIA_ALUGUEL_OUTRA",
        P35: "RENDA_ATE_5000",
        P36: "MARGEM_NEGATIVA",
        P37: "VULNERABILIDADE_FINANCEIRA",
        P38: "SEM_CAPACIDADE_ATUAL",
      },
      {
        housing: "RENTED_OR_OTHER",
        incomeBand: "UP_TO_5000",
        monthlyMargin: "NEGATIVE",
        debtStatus: "FINANCIAL_VULNERABILITY",
        investmentCapacity: "NONE_CURRENTLY",
      },
    ],
  ])("cria apenas o perfil descritivo %#", (overrides, expected) => {
    const profile = buildAdmissionFinancialProfile(buildInputs(overrides));
    expect(profile).toEqual(expected);
    expect(profile).not.toHaveProperty("score");
    expect(profile).not.toHaveProperty("grade");
    expect(profile).not.toHaveProperty("rank");
  });

  it.each([
    ["código desconhecido", buildInputs({ P35: "RENDA_DESCONHECIDA_X" })],
    ["código na pergunta errada", buildInputs({ P34: "RENDA_ATE_5000" })],
    ["configuração incompleta", buildInputs().slice(0, 4)],
    ["pergunta duplicada", [...buildInputs().slice(0, 4), buildInputs()[0]]],
  ])("recusa %s", (_label, inputs) => {
    expect(() => buildAdmissionFinancialProfile(inputs)).toThrow("FINANCIAL_PROFILE_CONFIGURATION_ERROR");
  });

  it.each([
    ["isPrivate", true],
    ["isScored", true],
    ["answerScore", 1],
    ["optionScore", 1],
  ] as const)("recusa configuração inválida em %s", (field, value) => {
    const inputs = buildInputs();
    inputs[0] = { ...inputs[0], [field]: value };
    expect(() => buildAdmissionFinancialProfile(inputs)).toThrow("FINANCIAL_PROFILE_CONFIGURATION_ERROR");
  });

  it("produz DTO com códigos sanitizados e labels, sem entidades, IDs ou score", () => {
    const dto = toAdmissionFinancialProfileDto(buildAdmissionFinancialProfile(buildInputs()));
    expect(dto).toEqual({
      housing: { code: "OWNED_PAID", label: "Imóvel próprio quitado" },
      incomeBand: { code: "ABOVE_10000", label: "Acima de R$ 10.000 por mês" },
      monthlyMargin: { code: "POSITIVE", label: "Normalmente existe alguma margem financeira" },
      debtStatus: { code: "CONTROLLED", label: "Compromissos financeiros controlados" },
      investmentCapacity: {
        code: "FULL",
        label: "Há capacidade atual sem comprometer despesas essenciais",
      },
    });
    expect(JSON.stringify(dto)).not.toMatch(
      /internalCode|answerId|optionId|score|passwordHash|userId|attemptId|QuestionOption|Answer/,
    );
  });
});
