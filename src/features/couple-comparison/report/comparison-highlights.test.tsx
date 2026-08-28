import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CoupleComparisonReportDto } from "@/types/couple-comparison-report";
import { ComparisonHighlights } from "./comparison-highlights";

const emptyHighlights: CoupleComparisonReportDto["highlights"] = {
  alignment: [],
  moderateDivergences: [],
  importantDivergences: [],
};

describe("destaques visuais da comparação", () => {
  it("mostra empty states adequados sem inventar problemas", () => {
    render(<ComparisonHighlights highlights={emptyHighlights} />);
    expect(screen.getByText("Nenhuma percepção semelhante foi identificada nesta comparação.")).toBeInTheDocument();
    expect(screen.getByText("Não existem diferenças moderadas de percepção neste relatório.")).toBeInTheDocument();
    expect(screen.getByText("Não existem diferenças importantes de percepção neste relatório.")).toBeInTheDocument();
  });

  it("mostra tema e área sem resposta ou score individual", () => {
    render(<ComparisonHighlights highlights={{
      ...emptyHighlights,
      alignment: [{
        questionCode: "P06",
        text: "Texto público da pergunta",
        area: "comunicacao",
        areaName: "Comunicação",
        classification: "CONVERGENCIA",
        classificationLabel: "Percepções semelhantes",
      }],
    }} />);
    expect(screen.getByText("Texto público da pergunta")).toBeInTheDocument();
    expect(screen.getByText("Comunicação")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Pessoa A|Pessoa B|respondeu [ABC]|score individual/i);
  });
});
