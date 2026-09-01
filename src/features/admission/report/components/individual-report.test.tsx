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
  rating: 6.7,
  ratingMax: 10,
  status: "PRECISA_MELHORAR",
  statusTitle: "PRECISA MELHORAR",
  statusDescription: "Existem pontos positivos, mas também dificuldades que merecem atenção, conversa e ajustes.",
  level: "warning",
};

const report: AdmissionIndividualReportDto = {
  attempt: { completedAt: "2026-08-26T23:30:00.000Z", questionnaireVersion: "8.0" },
  general: {
    rating: 4.6,
    ratingMax: 10,
    status: "PRECISA_MUDAR_COM_URGENCIA",
    statusTitle: "PRECISA MUDAR COM URGÊNCIA",
    statusDescription: "Há sinais importantes de dificuldade no relacionamento.",
    level: "danger",
  },
  answerCounts: { satisfactory: 9, intermediate: 10, relevantDifficulties: 6, total: 25 },
  areaGroups: { urgent: [], improvement: [area], good: [] },
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

  it("mostra a nota geral de 0 a 10 e explica a direção da escala", () => {
    render(<GeneralScoreCard general={report.general} />);
    expect(screen.getByText("4,6")).toBeInTheDocument();
    expect(screen.getByText(/\/ 10/)).toBeInTheDocument();
    expect(screen.getByText(/quanto maior a nota, melhor/i)).toBeInTheDocument();
    expect(screen.getByText("PRECISA MUDAR COM URGÊNCIA")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/27 de 50|pontuações mais altas indicam maior/i);
  });

  it("fornece nota e barra de área acessíveis na escala de 0 a 10", () => {
    render(<AreaResultCard area={area} />);
    const progress = screen.getByRole("progressbar", { name: /Comunicação: nota 6,7 de 10/i });
    expect(progress).toHaveAttribute("aria-valuenow", "6.7");
    expect(screen.getByText("6,7")).toBeInTheDocument();
    expect(screen.getByText("PRECISA MELHORAR")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/2 de 6|média .* de 2/i);
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
    expect(screen.getByRole("heading", { name: "Precisa mudar com urgência" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Precisa melhorar" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Está bom" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Temas específicos sinalizados" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Uma orientação privada para você" })).toBeInTheDocument();
    expect(screen.getByText(/não serão compartilhadas automaticamente/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar ao dashboard" })).toHaveAttribute("href", "/dashboard");
  });
});
