export type AdmissionErrorCode =
  | "ATTEMPT_NOT_FOUND"
  | "ATTEMPT_ALREADY_COMPLETED"
  | "QUESTION_NOT_IN_ATTEMPT"
  | "OPTION_NOT_IN_QUESTION"
  | "OUT_OF_SEQUENCE"
  | "QUESTIONNAIRE_UNAVAILABLE"
  | "ANSWER_CONFIGURATION_ERROR"
  | "INCOMPLETE_ATTEMPT"
  | "RESULT_NOT_FOUND"
  | "RESULT_CONFIGURATION_ERROR";

export class AdmissionAttemptError extends Error {
  constructor(public readonly code: AdmissionErrorCode) {
    super(code);
    this.name = "AdmissionAttemptError";
  }
}

export const ADMISSION_ERROR_MESSAGES: Record<AdmissionErrorCode, string> = {
  ATTEMPT_NOT_FOUND: "Não foi possível localizar esta tentativa.",
  ATTEMPT_ALREADY_COMPLETED: "Este exame já foi concluído e não pode ser alterado.",
  QUESTION_NOT_IN_ATTEMPT: "Esta pergunta não pertence ao exame em andamento.",
  OPTION_NOT_IN_QUESTION: "A alternativa selecionada não pertence a esta pergunta.",
  OUT_OF_SEQUENCE: "Responda as perguntas anteriores antes de continuar.",
  QUESTIONNAIRE_UNAVAILABLE: "O Exame de Admissão não está disponível no momento.",
  ANSWER_CONFIGURATION_ERROR: "Não foi possível salvar esta resposta. Tente novamente mais tarde.",
  INCOMPLETE_ATTEMPT: "Responda todas as perguntas antes de concluir.",
  RESULT_NOT_FOUND: "O resultado deste exame ainda não está disponível.",
  RESULT_CONFIGURATION_ERROR: "Não foi possível processar o resultado deste exame.",
};
