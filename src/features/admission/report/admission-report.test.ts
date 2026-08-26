import { describe, expect, it } from "vitest";
import { ADMISSION_SCORE_AREAS } from "@/features/admission/domain/admission-score-config";
import type { AdmissionCalculatedResult } from "@/types/admission-result";
import type { AdmissionReportAreaDto } from "@/types/admission-report";
import type { AdmissionPrivateSafetyResult } from "@/types/admission-safety";
import { buildAdmissionIndividualReportDto, groupAdmissionReportAreas } from "./admission-report";
import {
  AREA_REPORT_ORDER,
  GENERAL_REPORT_CONTENT,
  getAreaReportContent,
  getGeneralReportContent,
  getPriorityFlagContent,
} from "./admission-report-content";

const noneSafety: AdmissionPrivateSafetyResult = {
  overallLevel: "NONE",
  items: [
    { questionCode: "P31", level: "NONE" },
    { questionCode: "P32", level: "NONE" },
    { questionCode: "P33", level: "NONE" },
  ],
};

function calculatedResult(score = 0): AdmissionCalculatedResult {
  const perQuestion = score === 50 ? 2 : score === 25 ? 1 : 0;
  const classification = score === 50 ? "DESGASTE_CONJUGAL_MUITO_ELEVADO" : score === 25 ? "SINAIS_SIGNIFICATIVOS_DE_DESGASTE" : "BOA_BASE_CONJUGAL";
  return {
    totalScore: score,
    maxScore: 50,
    classification,
    answerCounts: score === 50 ? { A: 0, B: 0, C: 25 } : score === 25 ? { A: 0, B: 25, C: 0 } : { A: 25, B: 0, C: 0 },
    areas: ADMISSION_SCORE_AREAS.map((area) => ({
      area: area.key,
      score: area.questionCodes.length * perQuestion,
      maxScore: area.maxScore,
      averageScore: perQuestion.toFixed(2),
      classification: perQuestion === 0 ? "PONTO_FORTE" : perQuestion === 1 ? "PONTO_DE_ATENCAO" : "AREA_PRIORITARIA",
    })),
    flags: [],
  };
}

function build(result = calculatedResult(), safety = noneSafety) {
  return buildAdmissionIndividualReportDto({ completedAt: new Date("2026-08-26T13:00:00.000Z"), questionnaireVersion: "8.0", result, safety });
}

describe("conteúdo e DTO do relatório individual", () => {
  it.each([
    ["BOA_BASE_CONJUGAL", "Boa base conjugal"],
    ["PONTOS_IMPORTANTES_DE_AJUSTE", "Pontos importantes de ajuste"],
    ["SINAIS_SIGNIFICATIVOS_DE_DESGASTE", "Sinais significativos de desgaste"],
    ["DESCONEXAO_CONJUGAL_ELEVADA", "Desconexão conjugal elevada"],
    ["DESGASTE_CONJUGAL_MUITO_ELEVADO", "Desgaste conjugal muito elevado"],
  ])("mapeia %s para o título editorial", (classification, title) => {
    expect(getGeneralReportContent(classification).title).toBe(title);
  });

  it("mantém conteúdo para as nove áreas na ordem oficial", () => {
    expect(AREA_REPORT_ORDER).toHaveLength(9);
    expect(AREA_REPORT_ORDER).toEqual(ADMISSION_SCORE_AREAS.map(({ key }) => key));
    for (const key of AREA_REPORT_ORDER) {
      expect(getAreaReportContent(key).name).toBeTruthy();
      expect(getAreaReportContent(key).description).toBeTruthy();
    }
    expect(() => getAreaReportContent("area_desconhecida")).toThrow("REPORT_CONFIGURATION_ERROR");
  });

  it("agrupa 3 pontos fortes, 2 atenções e 4 prioridades sem duplicação", () => {
    const classifications = ["PONTO_FORTE", "PONTO_FORTE", "PONTO_FORTE", "PONTO_DE_ATENCAO", "PONTO_DE_ATENCAO", "AREA_PRIORITARIA", "AREA_PRIORITARIA", "AREA_PRIORITARIA", "AREA_PRIORITARIA"] as const;
    const areas = AREA_REPORT_ORDER.map((key, index): AdmissionReportAreaDto => ({
      key, name: key, description: key, score: 1, maxScore: 6,
      averageScore: ["0.20", "0.30", "0.40", "0.60", "1.00", "2.00", "1.50", "2.00", "1.20"][index],
      classification: classifications[index], classificationTitle: key, classificationSummary: key,
    }));
    const groups = groupAdmissionReportAreas(areas);
    expect(groups.strengths).toHaveLength(3);
    expect(groups.attention).toHaveLength(2);
    expect(groups.priorities).toHaveLength(4);
    expect(new Set([...groups.strengths, ...groups.attention, ...groups.priorities].map(({ key }) => key)).size).toBe(9);
    expect(groups.attention.map(({ averageScore }) => averageScore)).toEqual(["1.00", "0.60"]);
    expect(groups.priorities.map(({ key }) => key)).toEqual([
      "dinheiro_responsabilidades", "autopercepcao_disposicao", "tempo_conexao_futuro", "habitos_compulsoes",
    ]);
  });

  it("mapeia as quatro flags e recusa código desconhecido", () => {
    for (const code of ["CONVERSA_INTIMIDADE_PRIORITARIA", "FERIDA_CONFIANCA_PRIORITARIA", "INSATISFACAO_FUTURO_PRIORITARIA", "HABITO_COMPULSIVO_PRIORITARIO"]) {
      expect(getPriorityFlagContent(code).title).toBeTruthy();
      expect(getPriorityFlagContent(code).description).toBeTruthy();
    }
    expect(() => getPriorityFlagContent("FLAG_DESCONHECIDA")).toThrow("REPORT_CONFIGURATION_ERROR");
  });

  it("monta score 0 sem linguagem absoluta", () => {
    const report = build(calculatedResult(0));
    expect(report.general).toMatchObject({ totalScore: 0, maxScore: 50, title: "Boa base conjugal" });
    expect(JSON.stringify(report)).not.toMatch(/perfeito|totalmente seguro/i);
    expect(report.answerCounts).toEqual({ satisfactory: 25, intermediate: 0, relevantDifficulties: 0, total: 25 });
  });

  it("monta score 50 sem linguagem fatalista", () => {
    const report = build(calculatedResult(50));
    expect(report.general).toMatchObject({ totalScore: 50, maxScore: 50, title: "Desgaste conjugal muito elevado" });
    expect(JSON.stringify(report)).not.toMatch(/casamento acabou|condenado|fracassando/i);
    expect(report.answerCounts).toEqual({ satisfactory: 0, intermediate: 0, relevantDifficulties: 25, total: 25 });
  });

  it("apresenta todas B como 25 percepções intermediárias", () => {
    expect(build(calculatedResult(25)).answerCounts).toEqual({ satisfactory: 0, intermediate: 25, relevantDifficulties: 0, total: 25 });
  });

  it("omite safety NONE e mantém somente níveis sanitizados quando há orientação", () => {
    expect(build().safety).toBeNull();
    const attention: AdmissionPrivateSafetyResult = { ...noneSafety, overallLevel: "ATTENTION", items: noneSafety.items.map((item, index) => ({ ...item, level: index === 0 ? "ATTENTION" : "NONE" })) };
    const serialized = JSON.stringify(build(calculatedResult(), attention));
    expect(serialized).toContain("ATTENTION");
    expect(serialized).not.toMatch(/SAFETY_|CONSENT_/);
  });

  it("serializa somente o DTO sanitizado", () => {
    const result = calculatedResult(50);
    result.flags = [{ code: "CONVERSA_INTIMIDADE_PRIORITARIA", questionId: "secret-question-id", questionCode: "P18", severity: "PRIORITY" }];
    const serialized = JSON.stringify(build(result));
    expect(serialized).not.toMatch(/passwordHash|QuestionOption|internalCode|optionId|answerId|secret-question-id|SAFETY_|CONSENT_/);
    expect(serialized).not.toContain('"Answer"');
  });

  it("recusa classificação, área, flag e quantidade de áreas inválidas", () => {
    expect(() => getGeneralReportContent("UNKNOWN")).toThrow("REPORT_CONFIGURATION_ERROR");
    const missingArea = calculatedResult();
    missingArea.areas.pop();
    expect(() => build(missingArea)).toThrow("REPORT_CONFIGURATION_ERROR");
    const unknownFlag = calculatedResult();
    unknownFlag.flags = [{ code: "UNKNOWN", questionId: "q", questionCode: "P18", severity: "PRIORITY" }];
    expect(() => build(unknownFlag)).toThrow("REPORT_CONFIGURATION_ERROR");
  });

  it("possui conteúdo editorial para todas as classificações", () => {
    expect(Object.values(GENERAL_REPORT_CONTENT)).toHaveLength(5);
    expect(Object.values(GENERAL_REPORT_CONTENT).every(({ title, summary, recommendation }) => title && summary && recommendation)).toBe(true);
  });
});
