"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Badge, Button, Card, Modal, ProgressBar } from "@/components/ui";
import { saveContractAnswerAction, saveContractContextAction, submitContractAction, reopenContractAction } from "@/app/actions/contract.actions";
import type { Letter, OwnSessionDto } from "../domain/types";
import { ContractActionButton } from "./action-button";

const AUTO_ADVANCE_DELAY_MS = 1_000;

export function ContractQuestionnaire({ session }: { session: OwnSessionDto }) {
  const initialIndex = Math.max(0, session.questions.findIndex(q => q.state === "NOT_ANSWERED"));
  const [index, setIndex] = useState(initialIndex);
  const [furthestIndex, setFurthestIndex] = useState(initialIndex);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeBlockRef = useRef<HTMLButtonElement | null>(null);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const [waitingToAdvance, setWaitingToAdvance] = useState(false);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  const [reviewingBeforeCompletion, setReviewingBeforeCompletion] = useState(false);
  const [completionRevision, setCompletionRevision] = useState(session.revision);
  const router = useRouter();
  const q = session.questions[index];
  const reviewingPreviousQuestion = index < furthestIndex;
  const closed = session.status === "SUBMITTED";
  const notApplicable = session.questions.filter(question => question.state === "NOT_APPLICABLE").length;
  const resolved = session.answered + notApplicable;
  const missingComplements = session.questions.filter(question =>
    (question.privateModule && !question.privateAnswer)
    || (question.id === "Q103" && session.neckCompressionReport === null));
  const ready = resolved === session.questions.length && missingComplements.length === 0;
  const questionComplete = (question: OwnSessionDto["questions"][number]) => {
    if (question.state === "NOT_APPLICABLE") return true;
    if (!["A", "B", "C"].includes(question.state)) return false;
    if (question.privateModule && !question.privateAnswer) return false;
    return question.id !== "Q103" || session.neckCompressionReport !== null;
  };
  const goTo = (next: number) => {
    const bounded = Math.min(Math.max(next, 0), session.questions.length - 1);
    setIndex(bounded);
    setFurthestIndex(current => Math.max(current, bounded));
    setMessage("");
  };
  const save = (answer: Letter, privateAnswer?: Letter, neckCompressionReport?: boolean) => start(async () => {
    setMessage("");
    try {
      const result = await saveContractAnswerAction({ sessionId: session.id, revision: session.revision, questionId: q.id, answer, privateAnswer, neckCompressionReport });
      setMessage(result.ok ? "Salvo" : result.message);
      if (result.ok) {
        router.refresh();
        if (result.data?.questionnaireComplete && index === session.questions.length - 1) {
          setCompletionRevision(result.data.revision);
          setShowCompletionPrompt(true);
        } else if (result.data?.questionComplete && !reviewingPreviousQuestion && index < session.questions.length - 1) {
          setWaitingToAdvance(true);
          await new Promise(resolve => setTimeout(resolve, AUTO_ADVANCE_DELAY_MS));
          goTo(index + 1);
          setWaitingToAdvance(false);
        }
      }
    } catch { setMessage("A resposta não foi confirmada. Tente novamente."); }
  });

  const currentBlock = index < 9 ? 0 : Math.min(19, Math.floor((index + 1) / 10));

  useEffect(() => {
    if (activeBlockRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = activeBlockRef.current;
      const scrollLeft = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2;
      if (typeof container.scrollTo === "function") {
        container.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
      }
    }
  }, [currentBlock]);

  const scrollBlocks = (direction: "left" | "right") => {
    if (scrollContainerRef.current && typeof scrollContainerRef.current.scrollBy === "function") {
      const scrollAmount = direction === "left" ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return <div className="space-y-6">
    {closed ? (
      <Card className="space-y-3">
        <h2 className="text-xl font-semibold">Questionário concluído</h2>
        <p>Suas respostas foram concluídas com sucesso. Assim que os dois concluírem o questionário, o contrato estará disponível para download e impressão.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link className="inline-block font-semibold text-brand underline" href="/contrato/documento">Ver e baixar nosso contrato</Link>
          {!session.coupleConnected ? (
            <Link className="text-brand underline" href="/casal">Conectar meu parceiro depois</Link>
          ) : null}
        </div>
        <div className="pt-2">
          <p className="text-sm text-muted">Caso deseje corrigir suas respostas:</p>
          <ContractActionButton action={() => reopenContractAction(session.id, session.revision)}>Corrigir minhas respostas</ContractActionButton>
        </div>
      </Card>
    ) : null}
    <Card>
      <ProgressBar
        value={Math.round((resolved / session.questions.length) * 100)}
        label={`${resolved} de ${session.questions.length} perguntas respondidas`}
      />
    </Card>
    <Card className="space-y-3 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-brand-strong">Navegação em Blocos</h3>
          <p className="text-xs text-muted">20 blocos de 10 perguntas • Clique para ir ao bloco</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollBlocks("left")}
            className="flex size-7 items-center justify-center rounded-lg border border-line bg-surface text-brand hover:bg-slate-100 transition-colors"
            aria-label="Rolar blocos para a esquerda"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollBlocks("right")}
            className="flex size-7 items-center justify-center rounded-lg border border-line bg-surface text-brand hover:bg-slate-100 transition-colors"
            aria-label="Rolar blocos para a direita"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-2 px-1 scroll-smooth"
        style={{ scrollbarWidth: "thin" }}
      >
        {Array.from({ length: 20 }, (_, b) => {
          const isActive = b === currentBlock;
          const targetIndex = b === 0 ? 0 : Math.min(session.questions.length - 1, b * 10 - 1);
          const targetQuestionNum = b === 0 ? 1 : b * 10;
          const startIndex = b === 0 ? 0 : b * 10 - 1;
          const endIndex = b === 19 ? session.questions.length - 1 : (b === 0 ? 8 : b * 10 + 8);
          const blockSlice = session.questions.slice(startIndex, Math.min(session.questions.length, endIndex + 1));
          const answeredInBlock = blockSlice.filter(question => question.state !== "NOT_ANSWERED" && question.state !== "BLOCKED_BY_POLICY").length;
          const isComplete = blockSlice.length > 0 && answeredInBlock === blockSlice.length;

          return (
            <button
              key={b}
              ref={isActive ? activeBlockRef : null}
              type="button"
              onClick={() => goTo(targetIndex)}
              className="group flex flex-col items-center gap-1.5 shrink-0 transition-transform active:scale-95 focus:outline-none"
              title={`Bloco ${b}: Pergunta ${targetQuestionNum} (Clique para ir)`}
              aria-label={`Bloco ${b}, Pergunta ${targetQuestionNum}`}
              aria-current={isActive ? "step" : undefined}
            >
              <div
                className={`relative flex size-11 sm:size-12 items-center justify-center rounded-full font-bold text-sm transition-all ${
                  isActive
                    ? "border-2 border-[#1e3a5f] bg-[#1e3a5f] text-white shadow-md ring-4 ring-[#1e3a5f]/20 scale-105"
                    : isComplete
                    ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-700 hover:border-emerald-600 hover:bg-emerald-100"
                    : answeredInBlock > 0
                    ? "border-2 border-sky-300 bg-sky-50 text-sky-800 hover:border-sky-400"
                    : "border border-line bg-surface text-muted hover:border-brand/40 hover:text-brand-strong hover:bg-white"
                }`}
              >
                {isComplete && !isActive ? (
                  <svg className="size-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{b}</span>
                )}
                {isActive ? (
                  <span className="absolute -top-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-accent ring-2 ring-white">
                    <span className="size-1 rounded-full bg-white" />
                  </span>
                ) : null}
              </div>
              <span
                className={`text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? "font-bold text-[#1e3a5f]"
                    : "font-medium text-muted group-hover:text-brand-strong"
                }`}
              >
                Bloco {b}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
    <Card className="space-y-5">
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <Badge>{q.id}</Badge>
          <span className="text-sm text-muted">Pergunta {index + 1} de {session.questions.length}</span>
        </div>
        <span className="text-sm text-muted">{q.period}</span>
      </div>
      <h2 className="text-xl font-semibold text-brand-strong">{q.title}</h2>
      {q.relatedQuestions?.length ? <details><summary className="cursor-pointer text-sm text-brand">Consultar assuntos relacionados na minha sessão</summary><p className="mt-2 text-sm text-muted">Referências do Método para sua reflexão individual; não representam conclusão sobre o casal.</p><div className="mt-2 flex flex-wrap gap-3">{q.relatedQuestions.map(related => <button key={related.id} type="button" className="text-sm underline" onClick={() => goTo(session.questions.findIndex(item => item.id === related.id))}>{related.id} — {related.title}</button>)}</div></details> : null}
      {q.contextFields.map(field => <div key={field.id}><label className="block" htmlFor={`context-${field.id}`}>{field.label}</label>
        <p id={`help-${field.id}`} className="mt-1 text-sm text-muted">{field.help}</p>
        <select id={`context-${field.id}`} aria-describedby={`help-${field.id}`} className="mt-2 min-h-12 w-full rounded-xl border border-line p-3" disabled={closed || pending} value={session.context[field.id] === true ? "yes" : session.context[field.id] === false ? "no" : "unknown"} onChange={e => {
          const value = e.target.value === "unknown" ? null : e.target.value === "yes";
          start(async () => { try { const result = await saveContractContextAction({ sessionId: session.id, revision: session.revision, questionId: q.id, context: { [field.id]: value } }); setMessage(result.message); if (result.ok) { router.refresh(); if (result.data?.questionnaireComplete && index === session.questions.length - 1) { setCompletionRevision(result.data.revision); setShowCompletionPrompt(true); } else if (result.data?.questionComplete && !reviewingPreviousQuestion && index < session.questions.length - 1) { setWaitingToAdvance(true); await new Promise(resolve => setTimeout(resolve, AUTO_ADVANCE_DELAY_MS)); goTo(index + 1); setWaitingToAdvance(false); } } } catch { setMessage("Não foi possível salvar o contexto."); } });
        }}><option value="unknown">Não informado / não sei / prefiro não informar</option><option value="yes">Sim</option><option value="no">Não</option></select>
      </div>)}
      {q.state === "BLOCKED_BY_POLICY" ? <Alert>Esta pergunta aguarda a definição do seu contexto ou uma regra de aplicabilidade. Nenhuma resposta será presumida.</Alert>
        : q.state === "NOT_APPLICABLE" ? <Alert>Esta pergunta não se aplica ao contexto informado. Esse estado não equivale à alternativa A.</Alert>
        : <><fieldset disabled={closed || pending} className="space-y-3"><legend className="mb-4 text-lg">{q.prompt}</legend>{q.options.map(o => {
          const selected = q.state === o.code;
          return (
            <label
              key={o.code}
              className={`group flex min-h-14 cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition-all focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 ${
                selected
                  ? "border-[#1e3a5f] bg-[#1e3a5f] text-white shadow-sm"
                  : "border-line bg-white text-brand-strong hover:border-[#1e3a5f]/40 hover:bg-[#1e3a5f]/[0.02]"
              }`}
            >
              <input
                type="radio"
                name={q.id}
                value={o.code}
                checked={selected}
                onChange={() => save(o.code)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg border font-bold text-sm transition-colors ${
                  selected
                    ? "border-white bg-white text-[#1e3a5f]"
                    : "border-line bg-background text-brand-strong group-hover:border-[#1e3a5f]/40"
                }`}
              >
                {o.code}
              </span>
              <span className="text-base leading-snug">{o.text}</span>
            </label>
          );
        })}</fieldset>
          {q.id === "Q103" && ["A", "B", "C"].includes(q.state) ? <label className="block">Houve estrangulamento, sufocamento intencional ou compressão deliberada do pescoço, mesmo uma vez?
            <select className="mt-2 min-h-12 w-full rounded-xl border border-line p-3" disabled={closed || pending} value={session.neckCompressionReport === null ? "unknown" : session.neckCompressionReport ? "yes" : "no"} onChange={e => save(q.state as Letter, undefined, e.target.value === "yes")}>
              <option value="unknown" disabled>Selecione</option><option value="yes">Sim</option><option value="no">Não</option>
            </select></label> : null}
          {q.privateModule ? <fieldset disabled={closed || pending} className="space-y-3 rounded-xl bg-brand/5 p-4"><legend className="font-semibold">Complemento privado</legend><p>{q.privateModule.prompt}</p>{q.privateModule.options.map(o => {
            const selected = q.privateAnswer === o.code;
            return (
              <label
                key={o.code}
                className={`group flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                  selected
                    ? "border-[#1e3a5f] bg-[#1e3a5f] text-white shadow-sm"
                    : "border-line bg-surface text-brand-strong hover:border-[#1e3a5f]/40"
                }`}
              >
                <input
                  type="radio"
                  name={q.privateModule!.id}
                  checked={selected}
                  onChange={() => save(q.state as Letter, o.code)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg border font-bold text-xs transition-colors ${
                    selected
                      ? "border-white bg-white text-[#1e3a5f]"
                      : "border-line bg-background text-brand-strong"
                  }`}
                >
                  {o.code}
                </span>
                <span className="text-sm">{o.text}</span>
              </label>
            );
          })}</fieldset> : null}
        </>}
      <p role="status" className="text-sm text-muted">{waitingToAdvance ? "Salvo" : pending ? "Salvando…" : message}</p>
      <div className="flex justify-between items-center gap-3">
        <Button variant="secondary" disabled={pending || index === 0} onClick={() => goTo(index - 1)}>
          Anterior
        </Button>
        {reviewingBeforeCompletion ? (
          <ContractActionButton
            disabled={pending || !ready}
            action={async () => {
              const result = await submitContractAction(session.id, session.revision);
              if (result.ok && result.data && "redirectUrl" in (result.data as object) && (result.data as { redirectUrl?: string }).redirectUrl) {
                router.push((result.data as { redirectUrl: string }).redirectUrl);
              }
              return result;
            }}
          >
            Concluir o exame
          </ContractActionButton>
        ) : index === session.questions.length - 1 || ready || session.answered === session.questions.length ? (
          <Button
            disabled={pending || !ready}
            onClick={() => {
              setCompletionRevision(session.revision);
              setShowCompletionPrompt(true);
            }}
          >
            Concluir minhas respostas
          </Button>
        ) : reviewingPreviousQuestion && questionComplete(q) ? (
          <Button variant="secondary" disabled={pending} onClick={() => goTo(index + 1)}>
            Avançar
          </Button>
        ) : (
          <span />
        )}
      </div>
    </Card>
    <Modal isOpen={showCompletionPrompt} title="Deseja concluir o exame?" onClose={() => { setShowCompletionPrompt(false); setReviewingBeforeCompletion(true); }}>
      <p className="text-muted">Ao concluir, suas respostas serão encerradas para esta versão e o contrato do casal será gerado assim que ambos concluírem.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => { setShowCompletionPrompt(false); setReviewingBeforeCompletion(true); }}>Revisar respostas</Button>
        <ContractActionButton action={async () => {
          const result = await submitContractAction(session.id, completionRevision);
          if (result.ok) {
            setShowCompletionPrompt(false);
            if (result.data && "redirectUrl" in (result.data as object) && (result.data as { redirectUrl?: string }).redirectUrl) {
              router.push((result.data as { redirectUrl: string }).redirectUrl);
            }
          }
          return result;
        }}>Concluir o exame</ContractActionButton>
      </div>
    </Modal>
  </div>;
}
