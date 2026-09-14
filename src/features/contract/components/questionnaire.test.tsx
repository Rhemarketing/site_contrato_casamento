import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ContractQuestionnaire } from "./questionnaire";
import type { OwnSessionDto } from "../domain/types";
import { saveContractContextAction } from "@/app/actions/contract.actions";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/app/actions/contract.actions", () => ({ saveContractAnswerAction: vi.fn(), saveContractContextAction: vi.fn(), submitContractAction: vi.fn(), consentContractAction: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
function sessionFixture(): OwnSessionDto {
  return { id: "test", revision: 0, status: "IN_PROGRESS", version: "1.4.0-applicability.1", consented: false, context: {}, neckCompressionReport: null, answered: 0, blocked: 200,
    questions: Array.from({ length: 200 }, (_, i) => ({ id: `Q${String(i + 1).padStart(3, "0")}`, order: i + 1, title: `Assunto ${i + 1}`, prompt: null, period: "Últimos 90 dias", state: "BLOCKED_BY_POLICY", options: [], contextFields: [], privateModule: null, privateAnswer: null })) };
}
it("não exibe enunciado ou alternativas antes de resolver aplicabilidade", () => {
  const session = sessionFixture();
  render(<ContractQuestionnaire session={session} />);
  expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Concluir minhas respostas" })).toBeDisabled();
  expect(screen.getAllByRole("option")).toHaveLength(200);
});
it("explica o contexto individual e envia só a escolha explícita sem atribuir A", async () => {
  const session = sessionFixture();
  session.questions[0].contextFields = [{ id: "RESPONSABILIDADE_PARENTAL", label: "Você exerce responsabilidade parental?", help: "Não informe nomes de filhos." }];
  vi.mocked(saveContractContextAction).mockResolvedValue({ ok: true, message: "Contexto salvo." });
  render(<ContractQuestionnaire session={session} />);
  expect(screen.getByText("Não informe nomes de filhos.")).toBeInTheDocument();
  fireEvent.change(screen.getByRole("combobox", { name: "Você exerce responsabilidade parental?" }), { target: { value: "no" } });
  await waitFor(() => expect(saveContractContextAction).toHaveBeenCalledWith({ sessionId: "test", revision: 0, context: { RESPONSABILIDADE_PARENTAL: false } }));
  expect(screen.queryByRole("radio")).not.toBeInTheDocument();
});
it("conta inaplicabilidade no progresso sem chamá-la de resposta e exige todas as respostas aplicáveis", () => {
  const session = sessionFixture();
  session.blocked = 0;
  session.questions.forEach(q => { q.state = "NOT_APPLICABLE"; });
  session.questions[0].state = "NOT_ANSWERED";
  const { rerender } = render(<ContractQuestionnaire session={session} />);
  expect(screen.getByText("199 de 200 itens resolvidos")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Concluir minhas respostas" })).toBeDisabled();
  session.questions[0].state = "B"; session.answered = 1;
  rerender(<ContractQuestionnaire session={{ ...session }} />);
  expect(screen.getByText("200 de 200 itens resolvidos")).toBeInTheDocument();
  expect(screen.getByText(/1 respostas registradas · 199 não aplicáveis/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Concluir minhas respostas" })).toBeEnabled();
});
it("explica revisão privada ainda necessária sem exibir a Q181", () => {
  const session = sessionFixture();
  session.questions[0].privateReviewRequired = true;
  session.questions[0].contextFields = [{ id: "KNOWN_TRUST_BREACH", label: "Há histórico já conhecido?", help: "Contexto privado." }];
  session.context.KNOWN_TRUST_BREACH = true;
  render(<ContractQuestionnaire session={session} />);
  expect(screen.getByText(/A abordagem deste assunto aguarda revisão privada de segurança/)).toBeInTheDocument();
  expect(screen.queryByRole("radio")).not.toBeInTheDocument();
});
