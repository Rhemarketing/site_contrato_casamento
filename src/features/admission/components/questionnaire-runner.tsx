"use client";

import { useRef, useState, useTransition } from "react";
import { completeAdmissionAttemptAction, saveAdmissionAnswerAction } from "@/app/actions/admission.actions";
import { Alert, Badge, Button, Card, ProgressBar } from "@/components/ui";
import { calculateQuestionProgress, canContinueQuestion, getAdmissionStageTitle } from "@/features/admission/domain/admission-state";
import type { AdmissionAnswerDto, AdmissionQuestionDto } from "@/types/admission";

interface QuestionnaireRunnerProps {
  attemptId: string;
  questions: AdmissionQuestionDto[];
  initialAnswers: AdmissionAnswerDto[];
  initialQuestionIndex: number;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function QuestionnaireRunner({ attemptId, questions, initialAnswers, initialQuestionIndex }: QuestionnaireRunnerProps) {
  const [questionIndex, setQuestionIndex] = useState(initialQuestionIndex);
  const [answers, setAnswers] = useState(() => new Map(initialAnswers.map((answer) => [answer.questionId, answer.optionId])));
  const [selectedOptionId, setSelectedOptionId] = useState(() => answers.get(questions[initialQuestionIndex]?.id) ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  const [isCompleting, startCompleting] = useTransition();
  const saveSequence = useRef(0);
  const question = questions[questionIndex];

  if (!question) return <Alert variant="error">O questionário não possui perguntas disponíveis.</Alert>;

  const persisted = canContinueQuestion(question.id, answers.keys(), saveState === "saving");
  const goTo = (index: number) => {
    const next = Math.min(Math.max(index, 0), questions.length - 1);
    setQuestionIndex(next);
    setSelectedOptionId(answers.get(questions[next].id) ?? "");
    setSaveState("idle");
    setMessage("");
  };

  const selectOption = async (optionId: string) => {
    const sequence = ++saveSequence.current;
    const previous = answers.get(question.id) ?? "";
    setSelectedOptionId(optionId);
    setSaveState("saving");
    setMessage("");
    const result = await saveAdmissionAnswerAction({ attemptId, questionId: question.id, optionId });
    if (sequence !== saveSequence.current) return;
    if (!result.ok) {
      setSelectedOptionId(previous);
      setSaveState("error");
      setMessage(result.message);
      return;
    }
    setAnswers((current) => new Map(current).set(question.id, optionId));
    setSaveState("saved");
    setMessage("Resposta salva");
  };

  const complete = () => {
    setMessage("");
    startCompleting(async () => {
      const result = await completeAdmissionAttemptAction({ attemptId });
      if (result && !result.ok) {
        setSaveState("error");
        setMessage(result.message);
      }
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge>{getAdmissionStageTitle(question.stage)}</Badge>
        <span className="text-sm text-muted">Pergunta {questionIndex + 1} de {questions.length}</span>
      </div>
      <h1 className="mt-5 font-serif text-3xl text-brand-strong sm:text-4xl">Prova de Admissão</h1>
      <div className="mt-7">
        <ProgressBar value={calculateQuestionProgress(questionIndex, questions.length)} label={`Pergunta ${questionIndex + 1} de ${questions.length}`} />
      </div>

      {question.order === 31 ? (
        <Alert variant="warning" title="Sua privacidade importa" className="mt-6">
          Algumas das próximas perguntas tratam de segurança, respeito e limites pessoais. Suas respostas serão tratadas de forma privada. Responda considerando sua experiência pessoal.
        </Alert>
      ) : null}

      <Card className="mt-7 p-5 sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">{question.code}</p>
        <h2 id="question-text" className="mt-3 text-xl font-semibold leading-relaxed text-brand-strong sm:text-2xl">{question.text}</h2>
        {question.description ? <p id="question-description" className="mt-3 text-muted">{question.description}</p> : null}
        <fieldset className="mt-7 space-y-3" aria-labelledby="question-text" aria-describedby={question.description ? "question-description" : undefined}>
          <legend className="sr-only">Escolha uma alternativa</legend>
          {question.options.map((option) => {
            const selected = selectedOptionId === option.id;
            return (
              <label key={option.id} className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 ${selected ? "border-brand bg-brand/5" : "border-line bg-white hover:border-brand/50"}`}>
                <input type="radio" name={`answer-${question.id}`} value={option.id} checked={selected} onChange={() => void selectOption(option.id)} disabled={saveState === "saving" || isCompleting} className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-brand)]" />
                <span className="flex gap-2 text-brand-strong"><strong aria-hidden="true">{option.letter}.</strong><span>{option.text}</span></span>
                {selected ? <span className="sr-only">Alternativa selecionada</span> : null}
              </label>
            );
          })}
        </fieldset>
        <div className="mt-4 min-h-6 text-sm" aria-live="polite" aria-atomic="true">
          {saveState === "saving" ? <span className="text-muted">Salvando...</span> : null}
          {saveState === "saved" ? <span className="text-emerald-700">{message}</span> : null}
          {saveState === "error" ? <span role="alert" className="text-red-700">{message || "Não foi possível salvar sua resposta. Tente novamente."}</span> : null}
        </div>
      </Card>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {questionIndex > 0 ? <Button variant="secondary" onClick={() => goTo(questionIndex - 1)} disabled={saveState === "saving" || isCompleting}>Voltar</Button> : <span />}
        {questionIndex === questions.length - 1 ? (
          <Button onClick={complete} disabled={!persisted || isCompleting}>{isCompleting ? "Concluindo..." : "Concluir respostas"}</Button>
        ) : (
          <Button onClick={() => goTo(questionIndex + 1)} disabled={!persisted}>Continuar</Button>
        )}
      </div>
    </div>
  );
}
