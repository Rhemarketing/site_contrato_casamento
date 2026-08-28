import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CoupleComparisonReportAreaDto, CoupleComparisonReportDto } from "@/types/couple-comparison-report";
import { ComparisonAreaCard } from "./comparison-area-card";
import { ComparisonGuidance } from "./comparison-guidance";
import { ComparisonSummary } from "./comparison-summary";

const area: CoupleComparisonReportAreaDto = {
  area: "comunicacao",
  name: "Comunicação",
  description: "Descrição pública da área.",
  narrative: "Existem algumas diferenças de percepção nesta área.",
  averageDifference: 0.67,
  questionCount: 3,
  convergenceCount: 1,
  moderateDivergenceCount: 1,
  importantDivergenceCount: 1,
  questions: [{
    questionCode: "P06",
    text: "Texto público da pergunta",
    area: "comunicacao",
    areaName: "Comunicação",
    divergence: 1,
    classification: "DIVERGENCIA_MODERADA",
    classificationLabel: "Diferença de percepção",
  }],
};

const report: CoupleComparisonReportDto = {
  questionnaireVersion: "8.0",
  totalQuestions: 25,
  summary: { convergenceCount: 20, moderateDivergenceCount: 3, importantDivergenceCount: 2 },
  areas: [area],
  highlights: { alignment: [], moderateDivergences: [], importantDivergences: [] },
};

describe("componentes do relatório visual do casal", () => {
  it("mostra resumo geral, versão e aviso sem certo ou errado", () => {
    render(<ComparisonSummary report={report} />);
    expect(screen.getByRole("heading", { name: "Visão geral das percepções" })).toBeInTheDocument();
    expect(screen.getByText("Prova de Admissão — versão 8.0")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText(/não é determinar quem está certo ou errado/i)).toBeInTheDocument();
  });

  it("mostra área e pergunta em details acessível sem respostas individuais", () => {
    render(<ComparisonAreaCard area={area} position={1} />);
    expect(screen.getByRole("heading", { name: "Comunicação" })).toBeInTheDocument();
    expect(screen.getByText("Diferença de percepção")).toBeInTheDocument();
    expect(screen.getByText("Texto público da pergunta")).toBeInTheDocument();
    expect(screen.getByText("Ver as 3 perguntas desta área")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Pessoa A|Pessoa B|respondeu [ABC]|score individual/i);
  });

  it("apresenta as cinco orientações editoriais sem aconselhamento clínico", () => {
    const { container } = render(<ComparisonGuidance />);
    expect(screen.getByRole("heading", { name: "Como usar este relatório" })).toBeInTheDocument();
    expect(within(container).getAllByRole("listitem")).toHaveLength(5);
    expect(document.body.textContent).not.toMatch(/diagnóstico clínico|terapia|tratamento/i);
  });
});
