"use client";
import { useState, useTransition } from "react";
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
  return <div className="space-y-6">
    <Card className="space-y-3">
      <h2 className="text-xl font-semibold">Próximo passo</h2>
      {closed ? session.coupleConnected ? <>
        <p>Suas respostas estão concluídas. O contrato é gerado automaticamente assim que os dois terminarem o questionário.</p>
        <Link className="inline-block font-semibold text-brand underline" href="/contrato/documento">Ver e baixar nosso contrato</Link>
      </>
        : <><p>Suas respostas estão concluídas e salvas. Conecte as contas para que o contrato do casal seja gerado.</p><Link className="text-brand underline" href="/casal">Conectar meu parceiro</Link></>
        : ready ? <><p>Todos os itens estão resolvidos. Clique em Concluir minhas respostas abaixo para finalizar e gerar o contrato.</p><a className="text-brand underline" href="#conclusao">Ir para Concluir minhas respostas</a></>
        : <><p>Resolva as perguntas pendentes e os complementos privados antes de concluir.</p>
          {missingComplements.length ? <div className="space-y-2"><p>Complementos privados pendentes:</p>{missingComplements.map(question => <button key={question.id} type="button" className="mr-3 text-brand underline" onClick={() => goTo(session.questions.findIndex(item => item.id === question.id))}>{question.id} — preencher complemento</button>)}</div> : null}
        </>}
    </Card>
    {!session.coupleConnected ? <Alert>Você pode responder e concluir o questionário agora. Suas respostas ficam salvas na sua conta. <Link href="/casal" className="underline">Conectar meu parceiro depois</Link>.</Alert> : null}
    <Alert>As perguntas são liberadas conforme seu contexto individual. Alertas privados são informativos e não bloqueiam o contrato. <Link href="/contrato/privacidade" className="underline">Acessar minha área de privacidade.</Link></Alert>
    <Card><p className="text-muted">Suas respostas são individuais. O vínculo do casal não permite ao outro cônjuge ler suas respostas.</p>
      <div className="mt-4"><ProgressBar value={Math.round(resolved / session.questions.length * 100)} label={`${resolved} de ${session.questions.length} itens resolvidos`} /></div>
      <p className="mt-2 text-sm text-muted">{session.answered} respostas registradas · {notApplicable} não aplicáveis · {session.blocked} aguardando contexto.</p></Card>
    <label className="block text-sm font-semibold">Ir para pergunta
      <select className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface p-3" value={index} disabled={pending} onChange={e => goTo(Number(e.target.value))}>
        {session.questions.map((question, i) => <option key={question.id} value={i}>{question.id} — {question.title}</option>)}
      </select>
    </label>
    <Card className="space-y-5">
      <div className="flex justify-between gap-3"><Badge>{q.id}</Badge><span className="text-sm text-muted">{q.period}</span></div>
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
      <div className="flex justify-between"><Button variant="secondary" disabled={pending || index === 0} onClick={() => goTo(index - 1)}>Anterior</Button>{reviewingPreviousQuestion && index < session.questions.length - 1 && questionComplete(q) ? <Button variant="secondary" disabled={pending} onClick={() => goTo(index + 1)}>Avançar</Button> : <span />}</div>
    </Card>
    <Card className="space-y-4"><h2 id="conclusao" className="text-xl font-semibold">Conclusão</h2>{closed ? <>
      <p>Suas respostas foram concluídas com sucesso. Assim que os dois concluírem o questionário, o contrato estará disponível para download e impressão.</p>
      <Link className="inline-block font-semibold text-brand underline" href="/contrato/documento">Ir para Nosso Contrato</Link>
      <div className="pt-2">
        <p className="text-sm text-muted">Caso deseje corrigir suas respostas:</p>
        <ContractActionButton action={() => reopenContractAction(session.id, session.revision)}>Corrigir minhas respostas</ContractActionButton>
      </div>
    </> : <><p>Ao concluir, você encerra a edição desta versão das suas respostas e o contrato poderá ser gerado.</p>
      {reviewingBeforeCompletion
        ? <ContractActionButton disabled={pending || !ready} action={async () => {
            const result = await submitContractAction(session.id, session.revision);
            if (result.ok && result.data && "redirectUrl" in (result.data as object) && (result.data as { redirectUrl?: string }).redirectUrl) {
              router.push((result.data as { redirectUrl: string }).redirectUrl);
            }
            return result;
          }}>Concluir o exame</ContractActionButton>
        : <Button disabled={pending || !ready} onClick={() => { setCompletionRevision(session.revision); setShowCompletionPrompt(true); }}>Concluir minhas respostas</Button>}
    </>}</Card>
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
