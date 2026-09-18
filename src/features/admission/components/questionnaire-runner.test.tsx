import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { QuestionnaireRunner } from "./questionnaire-runner";
import { saveAdmissionAnswerAction } from "@/app/actions/admission.actions";
import type { AdmissionQuestionDto } from "@/types/admission";

vi.mock("@/app/actions/admission.actions", () => ({
  saveAdmissionAnswerAction: vi.fn(),
  completeAdmissionAttemptAction: vi.fn(),
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

const questions: AdmissionQuestionDto[] = ["P01", "P02", "P03"].map((code, index) => ({
  id: `question-${index + 1}`,
  code,
  order: index + 1,
  stage: "perfil",
  area: "identidade",
  text: `Pergunta ${index + 1}`,
  description: null,
  options: [{ id: `option-${index + 1}`, letter: "A", text: `Resposta ${index + 1}` }],
}));

it("avança após salvar uma resposta nova e mostra Avançar somente ao voltar para revisar", async () => {
  vi.mocked(saveAdmissionAnswerAction).mockResolvedValue({ ok: true });
  render(<QuestionnaireRunner attemptId="attempt-1" questions={questions} initialAnswers={[]} initialQuestionIndex={0} />);

  expect(screen.queryByRole("button", { name: /Continuar|Avançar/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("radio", { name: /Resposta 1/ }));
  await waitFor(() => expect(screen.getByText("Salvo")).toBeInTheDocument());
  expect(screen.getByRole("heading", { name: "Pergunta 1" })).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole("heading", { name: "Pergunta 2" })).toBeInTheDocument(), { timeout: 2_000 });
  expect(saveAdmissionAnswerAction).toHaveBeenCalledWith({ attemptId: "attempt-1", questionId: "question-1", optionId: "option-1" });
  expect(screen.queryByRole("button", { name: /Continuar|Avançar/ })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
  expect(screen.getByRole("heading", { name: "Pergunta 1" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Avançar" })).toBeEnabled();
  expect(screen.queryByRole("button", { name: "Continuar" })).not.toBeInTheDocument();
});

it("abre a confirmação após salvar a última resposta e troca o botão ao escolher revisão", async () => {
  vi.mocked(saveAdmissionAnswerAction).mockResolvedValue({ ok: true });
  render(<QuestionnaireRunner
    attemptId="attempt-1"
    questions={questions}
    initialAnswers={[{ questionId: "question-1", optionId: "option-1" }, { questionId: "question-2", optionId: "option-2" }]}
    initialQuestionIndex={2}
  />);

  fireEvent.click(screen.getByRole("radio", { name: /Resposta 3/ }));
  expect(await screen.findByRole("heading", { name: "Deseja concluir a prova?" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Concluir a prova" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Revisar respostas" }));
  await waitFor(() => expect(screen.queryByRole("heading", { name: "Deseja concluir a prova?" })).not.toBeInTheDocument());
  expect(screen.getByRole("button", { name: "Concluir a prova" })).toBeEnabled();
  expect(screen.queryByRole("button", { name: "Concluir respostas" })).not.toBeInTheDocument();
});
