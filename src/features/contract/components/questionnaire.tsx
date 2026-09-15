"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Badge, Button, Card, ProgressBar } from "@/components/ui";
import { saveContractAnswerAction, saveContractContextAction, submitContractAction, consentContractAction, reopenContractAction } from "@/app/actions/contract.actions";
import type { Letter, OwnSessionDto } from "../domain/types";
import { ContractActionButton } from "./action-button";

export function ContractQuestionnaire({ session }: { session: OwnSessionDto }) {
  const [index, setIndex] = useState(() => Math.max(0, session.questions.findIndex(q => q.state === "NOT_ANSWERED")));
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();
  const q = session.questions[index];
  const closed = session.status === "SUBMITTED";
  const notApplicable = session.questions.filter(question => question.state === "NOT_APPLICABLE").length;
  const resolved = session.answered + notApplicable;
  const waitingPrivateReview = q.privateReviewRequired && q.contextFields.every(field => session.context[field.id] === true);
  const save = (answer: Letter, privateAnswer?: Letter, neckCompressionReport?: boolean) => start(async () => {
    setMessage("");
    try {
      const result = await saveContractAnswerAction({ sessionId: session.id, revision: session.revision, questionId: q.id, answer, privateAnswer, neckCompressionReport });
      setMessage(result.ok ? "Resposta salva." : result.message);
      if (result.ok) router.refresh();
    } catch { setMessage("A resposta não foi confirmada. Tente novamente."); }
  });
  return <div className="space-y-6">
    {!session.coupleConnected ? <Alert>Você pode responder e concluir o questionário agora. Suas respostas ficam salvas na sua conta. <Link href="/casal" className="underline">Conectar meu parceiro depois</Link>.</Alert> : null}
    <Alert>As condições individuais e as exigências de revisão privada são verificadas antes de liberar as perguntas. <Link href="/contrato/privacidade" className="underline">Acessar minha área de privacidade e revisão.</Link></Alert>
    <Card><p className="text-muted">Suas respostas são individuais. O vínculo do casal não permite ao outro cônjuge ler suas respostas.</p>
      <div className="mt-4"><ProgressBar value={Math.round(resolved / session.questions.length * 100)} label={`${resolved} de ${session.questions.length} itens resolvidos`} /></div>
      <p className="mt-2 text-sm text-muted">{session.answered} respostas registradas · {notApplicable} não aplicáveis · {session.blocked} aguardando contexto ou revisão.</p></Card>
    <label className="block text-sm font-semibold">Ir para pergunta
      <select className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface p-3" value={index} disabled={pending} onChange={e => { setIndex(Number(e.target.value)); setMessage(""); }}>
        {session.questions.map((question, i) => <option key={question.id} value={i}>{question.id} — {question.title}</option>)}
      </select>
    </label>
    <Card className="space-y-5">
      <div className="flex justify-between gap-3"><Badge>{q.id}</Badge><span className="text-sm text-muted">{q.period}</span></div>
      <h2 className="text-xl font-semibold text-brand-strong">{q.title}</h2>
      {q.relatedQuestions?.length ? <details><summary className="cursor-pointer text-sm text-brand">Consultar assuntos relacionados na minha sessão</summary><p className="mt-2 text-sm text-muted">Referências do Método para sua reflexão individual; não representam conclusão sobre o casal.</p><div className="mt-2 flex flex-wrap gap-3">{q.relatedQuestions.map(related => <button key={related.id} type="button" className="text-sm underline" onClick={() => { setIndex(session.questions.findIndex(item => item.id === related.id)); setMessage(""); }}>{related.id} — {related.title}</button>)}</div></details> : null}
      {q.contextFields.map(field => <div key={field.id}><label className="block" htmlFor={`context-${field.id}`}>{field.label}</label>
        <p id={`help-${field.id}`} className="mt-1 text-sm text-muted">{field.help}</p>
        <select id={`context-${field.id}`} aria-describedby={`help-${field.id}`} className="mt-2 min-h-12 w-full rounded-xl border border-line p-3" disabled={closed || pending} value={session.context[field.id] === true ? "yes" : session.context[field.id] === false ? "no" : "unknown"} onChange={e => {
          const value = e.target.value === "unknown" ? null : e.target.value === "yes";
          start(async () => { try { const result = await saveContractContextAction({ sessionId: session.id, revision: session.revision, context: { [field.id]: value } }); setMessage(result.message); if (result.ok) router.refresh(); } catch { setMessage("Não foi possível salvar o contexto."); } });
        }}><option value="unknown">Não informado / não sei / prefiro não informar</option><option value="yes">Sim</option><option value="no">Não</option></select>
      </div>)}
      {q.state === "BLOCKED_BY_POLICY" ? <Alert>{waitingPrivateReview ? "A abordagem deste assunto aguarda revisão privada de segurança. Informar o contexto não libera essa revisão." : "Esta pergunta aguarda a definição do seu contexto ou uma regra de aplicabilidade. Nenhuma resposta será presumida."}</Alert>
        : q.state === "NOT_APPLICABLE" ? <Alert>Esta pergunta não se aplica ao contexto informado. Esse estado não equivale à alternativa A.</Alert>
        : <><fieldset disabled={closed || pending} className="space-y-3"><legend className="mb-4 text-lg">{q.prompt}</legend>{q.options.map(o => <label key={o.code} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${q.state === o.code ? "border-brand bg-brand/5" : "border-line"}`}>
          <input type="radio" name={q.id} value={o.code} checked={q.state === o.code} onChange={() => save(o.code)} /><span><strong>{o.code}.</strong> {o.text}</span>
        </label>)}</fieldset>
          {q.id === "Q103" && ["A", "B", "C"].includes(q.state) ? <label className="block">Houve estrangulamento, sufocamento intencional ou compressão deliberada do pescoço, mesmo uma vez?
            <select className="mt-2 min-h-12 w-full rounded-xl border border-line p-3" disabled={closed || pending} value={session.neckCompressionReport === null ? "unknown" : session.neckCompressionReport ? "yes" : "no"} onChange={e => save(q.state as Letter, undefined, e.target.value === "yes")}>
              <option value="unknown" disabled>Selecione</option><option value="yes">Sim</option><option value="no">Não</option>
            </select></label> : null}
          {q.privateModule ? <fieldset disabled={closed || pending} className="space-y-3 rounded-xl bg-brand/5 p-4"><legend className="font-semibold">Complemento privado</legend><p>{q.privateModule.prompt}</p>{q.privateModule.options.map(o => <label key={o.code} className="flex gap-3 rounded-xl border border-line bg-surface p-3"><input type="radio" name={q.privateModule!.id} checked={q.privateAnswer === o.code} onChange={() => save(q.state as Letter, o.code)} />{o.text}</label>)}</fieldset> : null}
        </>}
      <p role="status" className="text-sm text-muted">{pending ? "Salvando…" : message}</p>
      <div className="flex justify-between"><Button variant="secondary" disabled={pending || index === 0} onClick={() => { setIndex(index - 1); setMessage(""); }}>Anterior</Button><Button variant="secondary" disabled={pending || index === 199} onClick={() => { setIndex(index + 1); setMessage(""); }}>Próxima</Button></div>
    </Card>
    <Card className="space-y-4"><h2 className="text-xl font-semibold">Conclusão e consentimento</h2>{closed ? <>
      <p>Autorizar permite a avaliação das duas sessões para preparar decisões e textos elegíveis. As respostas brutas e privadas continuam restritas.</p>
      {session.coupleConnected ? <ContractActionButton action={() => consentContractAction(session.id, session.revision, !session.consented)}>{session.consented ? "Revogar autorização" : "Autorizar avaliação do casal"}</ContractActionButton> : <p>Suas respostas estão concluídas e salvas. Conecte seu parceiro quando quiser continuar para a avaliação e a montagem do contrato. Depois da conexão, cada pessoa deverá autorizar a avaliação.</p>}
      <p>Corrigir respostas revoga a autorização e invalida propostas e documentos derivados desta sessão. Novas confirmações serão necessárias.</p><ContractActionButton action={() => reopenContractAction(session.id, session.revision)}>Corrigir minhas respostas</ContractActionButton>
    </> : <><p>Concluir encerra a edição desta versão das respostas. A avaliação do casal exige uma autorização separada de cada pessoa.</p>
      <ContractActionButton disabled={pending || resolved !== session.questions.length} action={() => submitContractAction(session.id, session.revision)}>Concluir minhas respostas</ContractActionButton>
    </>}</Card>
  </div>;
}
