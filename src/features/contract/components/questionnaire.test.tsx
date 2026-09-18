import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ContractQuestionnaire } from "./questionnaire";
import type { OwnSessionDto } from "../domain/types";
import { saveContractAnswerAction, saveContractContextAction } from "@/app/actions/contract.actions";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/app/actions/contract.actions", () => ({ saveContractAnswerAction: vi.fn(), saveContractContextAction: vi.fn(), submitContractAction: vi.fn(), consentContractAction: vi.fn(), reopenContractAction: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
function sessionFixture(): OwnSessionDto {
  return { id: "test", revision: 0, status: "IN_PROGRESS", version: "1.4.0-applicability.1", coupleConnected: true, consented: false, context: {}, neckCompressionReport: null, answered: 0, blocked: 200,
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
  await waitFor(() => expect(saveContractContextAction).toHaveBeenCalledWith({ sessionId: "test", revision: 0, questionId: "Q001", context: { RESPONSABILIDADE_PARENTAL: false } }));
  expect(screen.queryByRole("radio")).not.toBeInTheDocument();
});
it("conta inaplicabilidade no progresso sem chamá-la de resposta e exige todas as respostas aplicáveis", () => {
  const session = sessionFixture();
  session.neckCompressionReport = false;
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
it("avança ao salvar resposta nova e mostra Avançar somente ao voltar para revisar", async () => {
  const session = sessionFixture();
  session.questions[0] = { ...session.questions[0], state: "NOT_ANSWERED", prompt: "Escolha", options: [{ code: "A", text: "Resposta A" }] };
  session.questions[1] = { ...session.questions[1], state: "NOT_ANSWERED", prompt: "Escolha seguinte", options: [{ code: "A", text: "Resposta seguinte" }] };
  vi.mocked(saveContractAnswerAction).mockResolvedValue({ ok: true, message: "Resposta salva.", data: { questionComplete: true } });
  const { rerender } = render(<ContractQuestionnaire session={session} />);

  expect(screen.queryByRole("button", { name: /Próxima|Avançar/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("radio", { name: /Resposta A/ }));
  await waitFor(() => expect(screen.getByText("Salvo")).toBeInTheDocument());
  expect(screen.getByRole("heading", { name: "Assunto 1" })).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole("heading", { name: "Assunto 2" })).toBeInTheDocument(), { timeout: 2_000 });
  expect(screen.queryByRole("button", { name: /Próxima|Avançar/ })).not.toBeInTheDocument();

  session.questions[0].state = "A";
  session.revision += 1;
  rerender(<ContractQuestionnaire session={{ ...session }} />);
  fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
  expect(screen.getByRole("button", { name: "Avançar" })).toBeEnabled();
  expect(screen.queryByRole("button", { name: "Próxima" })).not.toBeInTheDocument();
});

it("permanece na pergunta enquanto um complemento obrigatório ainda está pendente", async () => {
  const session = sessionFixture();
  session.questions[0] = { ...session.questions[0], state: "NOT_ANSWERED", prompt: "Escolha", options: [{ code: "A", text: "Resposta com complemento" }] };
  vi.mocked(saveContractAnswerAction).mockResolvedValue({ ok: true, message: "Resposta salva.", data: { questionComplete: false } });
  render(<ContractQuestionnaire session={session} />);

  fireEvent.click(screen.getByRole("radio", { name: /Resposta com complemento/ }));
  await waitFor(() => expect(saveContractAnswerAction).toHaveBeenCalledOnce());
  expect(screen.getByRole("heading", { name: "Assunto 1" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Próxima|Avançar/ })).not.toBeInTheDocument();
});

it("mostra o complemento pendente da Q103 mesmo com 200 respostas registradas", () => {
  const session = sessionFixture();
  session.questions.forEach(q => { q.state = "A"; });
  session.answered = 200; session.blocked = 0;
  render(<ContractQuestionnaire session={session} />);
  expect(screen.getByRole("button", { name: "Concluir minhas respostas" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Q103 — preencher complemento" }));
  expect(screen.getByRole("combobox", { name: /Houve estrangulamento/ })).toBeInTheDocument();
});

it("orienta concluir, autorizar e seguir para decisões conforme o estado da própria sessão", () => {
  const session = sessionFixture();
  session.questions.forEach(q => { q.state = "A"; });
  session.answered = 200; session.blocked = 0; session.neckCompressionReport = false;
  const { rerender } = render(<ContractQuestionnaire session={session} />);
  expect(screen.getByRole("link", { name: "Ir para Concluir minhas respostas" })).toHaveAttribute("href", "#conclusao");
  session.status = "SUBMITTED";
  rerender(<ContractQuestionnaire session={{ ...session }} />);
  expect(screen.getByRole("link", { name: "Ir para Autorizar avaliação do casal" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Continuar para NÓS DECIDIMOS" })).not.toBeInTheDocument();
  session.consented = true;
  rerender(<ContractQuestionnaire session={{ ...session }} />);
  expect(screen.getByRole("link", { name: "Continuar para NÓS DECIDIMOS" })).toHaveAttribute("href", "/contrato/decisoes");
  expect(screen.getByRole("link", { name: "Nosso contrato" })).toHaveAttribute("href", "/contrato/documento");
});
it("explica contexto pendente sem solicitar revisão", () => {
  const session = sessionFixture();
  session.questions[0].privateReviewRequired = true;
  session.questions[0].contextFields = [{ id: "KNOWN_TRUST_BREACH", label: "Há histórico já conhecido?", help: "Contexto privado." }];
  session.context.KNOWN_TRUST_BREACH = true;
  render(<ContractQuestionnaire session={session} />);
  expect(screen.getByText(/Esta pergunta aguarda a definição do seu contexto/)).toBeInTheDocument();
  expect(screen.queryByRole("radio")).not.toBeInTheDocument();
});

it("permite concluir individualmente e orienta conectar depois sem autorizar antes", () => {
  const session = sessionFixture();
  session.coupleConnected = false;
  session.status = "SUBMITTED";
  render(<ContractQuestionnaire session={session} />);
  expect(screen.getByRole("link", { name: "Conectar meu parceiro depois" })).toHaveAttribute("href", "/casal");
  expect(screen.queryByRole("button", { name: "Autorizar avaliação do casal" })).not.toBeInTheDocument();
  expect(screen.getByText(/Suas respostas estão concluídas e salvas/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Corrigir minhas respostas" })).toBeEnabled();
});
