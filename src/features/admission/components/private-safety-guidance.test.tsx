import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AdmissionPrivateSafetyResult } from "@/types/admission-safety";
import { PrivateSafetyGuidance } from "./private-safety-guidance";

function result(overallLevel: AdmissionPrivateSafetyResult["overallLevel"]): AdmissionPrivateSafetyResult {
  return { overallLevel, items: [
    { questionCode: "P31", level: "NONE" },
    { questionCode: "P32", level: overallLevel },
    { questionCode: "P33", level: "NONE" },
  ] };
}

describe("orientação privada de segurança", () => {
  it("não exibe conclusão absoluta para NONE", () => {
    const { container } = render(<PrivateSafetyGuidance result={result("NONE")} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(/totalmente seguro/i)).not.toBeInTheDocument();
  });

  it.each(["ATTENTION", "ALERT", "HIGH_ALERT"] as const)("exibe orientação acessível e privada para %s", (level) => {
    const { unmount } = render(<PrivateSafetyGuidance result={result(level)} />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
    expect(screen.getByText(/não serão compartilhadas automaticamente/i)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/SAFETY_|CONSENT_|confronte/i);
    unmount();
  });

  it("prioriza emergência regional sem exigir confronto em HIGH_ALERT", () => {
    render(<PrivateSafetyGuidance result={result("HIGH_ALERT")} />);
    expect(screen.getByText(/serviço de emergência ou apoio especializado/i)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/converse com seu parceiro|confronte/i);
  });
});
