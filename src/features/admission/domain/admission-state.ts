import { getAdmissionStageTitle } from "@/config/admission-questionnaire";
import type { AdmissionQuestionDto } from "@/types/admission";

type PersistedQuestion = {
  id: string;
  code: string;
  order: number;
  stage: string;
  area: string;
  text: string;
  description: string | null;
  options: Array<{ id: string; letter: string; text: string }>;
};

export function toAdmissionQuestionDto(question: PersistedQuestion): AdmissionQuestionDto {
  return {
    id: question.id,
    code: question.code,
    order: question.order,
    stage: question.stage,
    area: question.area,
    text: question.text,
    description: question.description,
    options: question.options.map(({ id, letter, text }) => ({ id, letter, text })),
  };
}

export function findFirstUnansweredIndex(questions: Array<{ id: string }>, answeredQuestionIds: Iterable<string>) {
  const answered = new Set(answeredQuestionIds);
  const index = questions.findIndex((question) => !answered.has(question.id));
  return index === -1 ? Math.max(questions.length - 1, 0) : index;
}

export function calculateQuestionProgress(questionIndex: number, questionCount: number) {
  if (questionCount <= 0) return 0;
  return Math.round(((questionIndex + 1) / questionCount) * 100);
}

export function canContinueQuestion(questionId: string, persistedQuestionIds: Iterable<string>, isSaving: boolean) {
  return !isSaving && new Set(persistedQuestionIds).has(questionId);
}

export function canSaveQuestionInSequence(
  questionId: string,
  orderedQuestionIds: string[],
  answeredQuestionIds: Iterable<string>,
) {
  const answered = new Set(answeredQuestionIds);
  if (answered.has(questionId)) return true;
  return orderedQuestionIds.find((id) => !answered.has(id)) === questionId;
}

export { getAdmissionStageTitle };
