import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AdmissionIndividualReportDto, AdmissionReportAreaDto } from "@/types/admission-report";
import { AnswerDistribution } from "./answer-distribution";
import { AreaResultCard } from "./area-result-card";
import { GeneralScoreCard } from "./general-score-card";
import { IndividualAdmissionReport } from "./individual-report";
import { formatAdmissionCompletionDate } from "./report-header";

const area: AdmissionReportAreaDto = {
  key: "comunicacao",
  name: "Comunicação",
  description: "Como vocês conversam.",
  score: 2,
  maxScore: 6,
  averageScore: "0.67",
  classification: "PONTO_DE_ATENCAO",
  classificationTitle: "Ponto de atenção",
  classificationSummary: "Esta área merece atenção.",
};

const report: AdmissionIndividualReportDto = {
  attempt: { completedAt: "2026-08-26T23:30:00.000Z", questionnaireVersion: "8.0" },
  general: {
    totalScore: 27,
    maxScore: 50,
    classification: "SINAIS_SIGNIFICATIVOS_DE_DESGASTE",
    title: "Sinais significativos de desgaste",
    summary: "Diferentes áreas apresentam sinais relevantes.",
    recommendation: "Identifique prioridades.",
  },
  answerCounts: { satisfactory: 9, intermediate: 10, relevantDifficulties: 6, total: 25 },
  areaGroups: { strengths: [], attention: [area], priorities: [] },
  flags: [{ code: "CONVERSA_INTIMIDADE_PRIORITARIA", title: "Conversa sobre intimidade merece atenção", description: "Tema conjugal específico.", recommendation: null }],
  safety: {
    overallLevel: "ATTENTION",
    items: [
      { questionCode: "P31", level: "ATTENTION" },
      { questionCode: "P32", level: "NONE" },
      { questionCode: "P33", level: "NONE" },
    ],
  },
};

describe("componentes do relatório individual", () => {
  it("formata a data em pt-BR com timezone estável", () => {
    expect(formatAdmissionCompletionDate("2026-08-26T23:30:00.000Z")).toBe("26 de agosto de 2026");
  });

  it("mostra score absoluto e explica a direção da escala", () => {
    render(<GeneralScoreCard general={report.general} />);
    expect(screen.getByText("27")).toBeInTheDocument();
    expect(screen.getByText(/de 50/)).toBeInTheDocument();
    expect(screen.getByText(/pontuações mais altas indicam maior/i)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("54%");
  });

  it("fornece barra de área acessível sem percentual textual", () => {
    render(<AreaResultCard area={area} />);
    const progress = screen.getByRole("progressbar", { name: /Comunicação: média 0,67 de 2/i });
    expect(progress).toHaveAttribute("aria-valuenow", "0.67");
    expect(screen.getByText("2 de 6")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("33.5%");
  });

  it("apresenta counts com contexto sem revelar A/B/C", () => {
    render(<AnswerDistribution counts={report.answerCounts} />);
    expect(screen.getByLabelText(/9 respostas indicaram percepção satisfatória/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/10 respostas indicaram pontos intermediários/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/6 respostas indicaram dificuldades mais relevantes/i)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/A\s*=|B\s*=|C\s*=/);
  });

  it("renderiza relatório completo com seções conjugais e Safety separadas", () => {
    render(<IndividualAdmissionReport report={report} />);
    expect(screen.getByRole("heading", { name: "Resultado da sua Prova de Admissão" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pontos fortes" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pontos que merecem atenção" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Áreas prioritárias" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Temas prioritários específicos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Uma orientação privada para você" })).toBeInTheDocument();
    expect(screen.getByText(/não serão compartilhadas automaticamente/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar ao dashboard" })).toHaveAttribute("href", "/dashboard");
  });
});
