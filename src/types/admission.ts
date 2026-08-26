export interface AdmissionOptionDto {
  id: string;
  letter: string;
  text: string;
}

export interface AdmissionQuestionDto {
  id: string;
  code: string;
  order: number;
  stage: string;
  area: string;
  text: string;
  description: string | null;
  options: AdmissionOptionDto[];
}

export interface AdmissionAnswerDto {
  questionId: string;
  optionId: string;
}

export type AdmissionAttemptState =
  | { kind: "NOT_STARTED" }
  | { kind: "COMPLETED"; attemptId: string }
  | {
      kind: "OPEN";
      attemptId: string;
      status: "STARTED" | "IN_PROGRESS";
      questions: AdmissionQuestionDto[];
      answers: AdmissionAnswerDto[];
      currentQuestionIndex: number;
    };

export interface AdmissionAttemptSummary {
  state: "NOT_STARTED" | "OPEN" | "COMPLETED";
  answerCount: number;
  questionCount: number;
}
