import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ContractQuestionnaire } from "./questionnaire";
import type { OwnSessionDto } from "../domain/types";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/app/actions/contract.actions", () => ({ saveContractAnswerAction: vi.fn(), saveContractContextAction: vi.fn(), submitContractAction: vi.fn(), consentContractAction: vi.fn() }));
it("não exibe enunciado ou alternativas antes de resolver aplicabilidade", () => {
  const session: OwnSessionDto = { id: "test", revision: 0, status: "IN_PROGRESS", version: "1.4.0", consented: false, context: {}, neckCompressionReport: null, answered: 0, blocked: 200,
    questions: Array.from({ length: 200 }, (_, i) => ({ id: `Q${i + 1}`, order: i + 1, title: `Assunto ${i + 1}`, prompt: null, period: "Últimos 90 dias", state: "BLOCKED_BY_POLICY", options: [], contextFields: [], privateModule: null, privateAnswer: null })) };
  render(<ContractQuestionnaire session={session} />);
  expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Concluir minhas respostas" })).toBeDisabled();
  expect(screen.getAllByRole("option")).toHaveLength(200);
});
