import { describe, expect, it } from "vitest";
import type { AdmissionSafetyInput } from "@/types/admission-safety";
import { calculateAdmissionSafety, mapSafetyInternalCode } from "./admission-safety";
import {
  canViewPrivateAnswer,
  isComparisonEligibleAdmissionQuestion,
  isShareableAdmissionQuestion,
} from "./private-answer-policy";

function input(questionCode: string, internalCode: string): AdmissionSafetyInput {
  return { questionCode, internalCode, isPrivate: true, isScored: false, answerScore: null, optionScore: null };
}

describe("política e motor privado de segurança", () => {
  it.each([
    ["SAFETY_0", "NONE"], ["CONSENT_OK", "NONE"],
    ["SAFETY_ATTENTION", "ATTENTION"], ["CONSENT_ATTENTION", "ATTENTION"],
    ["SAFETY_ALERT", "ALERT"], ["CONSENT_ALERT", "ALERT"],
    ["SAFETY_ALERT_HIGH", "HIGH_ALERT"],
  ])("mapeia %s para %s", (code, level) => expect(mapSafetyInternalCode(code)).toBe(level));

  it("recusa código interno desconhecido", () => {
    expect(() => mapSafetyInternalCode("UNKNOWN")).toThrow("PRIVATE_SAFETY_CONFIGURATION_ERROR");
  });

  it.each([
    [[input("P31", "SAFETY_0"), input("P32", "SAFETY_0"), input("P33", "CONSENT_OK")], "NONE"],
    [[input("P31", "SAFETY_0"), input("P32", "SAFETY_ATTENTION"), input("P33", "CONSENT_OK")], "ATTENTION"],
    [[input("P31", "SAFETY_ALERT"), input("P32", "SAFETY_ATTENTION"), input("P33", "CONSENT_OK")], "ALERT"],
    [[input("P31", "SAFETY_ALERT"), input("P32", "SAFETY_ALERT_HIGH"), input("P33", "CONSENT_OK")], "HIGH_ALERT"],
  ] as const)("agrega os três níveis em %s", (items, expected) => {
    expect(calculateAdmissionSafety([...items]).overallLevel).toBe(expected);
    expect(calculateAdmissionSafety([...items].reverse()).overallLevel).toBe(expected);
  });

  it("exige exatamente P31, P32 e P33", () => {
    expect(() => calculateAdmissionSafety([input("P31", "SAFETY_0"), input("P33", "CONSENT_OK")])).toThrow("PRIVATE_SAFETY_CONFIGURATION_ERROR");
    expect(() => calculateAdmissionSafety([input("P31", "SAFETY_0"), input("P32", "SAFETY_0"), input("P34", "CONSENT_OK")])).toThrow("PRIVATE_SAFETY_CONFIGURATION_ERROR");
  });

  it("recusa score, questão não privada ou código incompatível com a pergunta", () => {
    const scored = input("P31", "SAFETY_0");
    scored.answerScore = 1;
    expect(() => calculateAdmissionSafety([scored, input("P32", "SAFETY_0"), input("P33", "CONSENT_OK")])).toThrow("PRIVATE_SAFETY_CONFIGURATION_ERROR");
    const publicQuestion = input("P31", "SAFETY_0");
    publicQuestion.isPrivate = false;
    expect(() => calculateAdmissionSafety([publicQuestion, input("P32", "SAFETY_0"), input("P33", "CONSENT_OK")])).toThrow("PRIVATE_SAFETY_CONFIGURATION_ERROR");
    expect(() => calculateAdmissionSafety([input("P31", "CONSENT_OK"), input("P32", "SAFETY_0"), input("P33", "CONSENT_OK")])).toThrow("PRIVATE_SAFETY_CONFIGURATION_ERROR");
  });

  it("permite visualização somente ao owner e aplica default deny no compartilhamento", () => {
    expect(canViewPrivateAnswer("owner", "owner")).toBe(true);
    expect(canViewPrivateAnswer("partner", "owner")).toBe(false);
    expect(isShareableAdmissionQuestion({ code: "P31", isPrivate: false })).toBe(false);
    expect(isShareableAdmissionQuestion({ code: "P20", isPrivate: true })).toBe(false);
    expect(isShareableAdmissionQuestion({ code: "P20", isPrivate: false })).toBe(true);
    expect(isShareableAdmissionQuestion({ code: "P34", isPrivate: false })).toBe(false);
    expect(isShareableAdmissionQuestion({ code: "P41", isPrivate: false })).toBe(false);
  });

  it("restringe comparação a P06-P30 mesmo entre perguntas compartilháveis", () => {
    expect(isComparisonEligibleAdmissionQuestion({ code: "P06", isPrivate: false })).toBe(true);
    expect(isComparisonEligibleAdmissionQuestion({ code: "P30", isPrivate: false })).toBe(true);
    for (const code of ["P01", "P05", "P31", "P33", "P34", "P39", "P40"]) {
      expect(isComparisonEligibleAdmissionQuestion({ code, isPrivate: false })).toBe(false);
    }
    expect(isComparisonEligibleAdmissionQuestion({ code: "P20", isPrivate: true })).toBe(false);
  });
});
