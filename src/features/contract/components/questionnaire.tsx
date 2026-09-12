"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, Card, ProgressBar } from "@/components/ui";
import { saveContractAnswerAction, saveContractContextAction, submitContractAction, consentContractAction } from "@/app/actions/contract.actions";
import type { Letter, OwnSessionDto } from "../domain/types";
import { ContractActionButton } from "./action-button";

const contextLabels: Record<string, string> = {
  PREGNANCY_POSSIBLE: "A possibilidade de gravidez faz parte do seu contexto?",
  PREGNANCY_POSTPARTUM_RELEVANT: "Gravidez ou pós-parto fazem parte do seu contexto atual?",
  RESPONSABILIDADE_PARENTAL: "Você tem responsabilidade parental?",
  HAS_CHILDREN_OR_DEPENDENTS: "Há filhos ou dependentes no seu contexto?",
  USES_INTOXICATING_SUBSTANCE: "Você utiliza alguma substância intoxicante?",
};
export function ContractQuestionnaire({ session }: { session: OwnSessionDto }) {
  const [index, setIndex] = useState(() => Math.max(0, session.questions.findIndex(q => q.state === "NOT_ANSWERED")));
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();
  const q = session.questions[index];
  const closed = session.status === "SUBMITTED";
  const save = (answer: Letter, privateAnswer?: Letter, neckCompressionReport?: boolean) => start(async () => {
    setMessage("");
    try {
      const result = await saveContractAnswerAction({ sessionId: session.id, revision: session.revision, questionId: q.id, answer, privateAnswer, neckCompressionReport });
      setMessage(result.ok ? "Resposta salva." : result.message);
      if (result.ok) router.refresh();
    } catch { setMessage("A resposta não foi confirmada. Tente novamente."); }
  });
  return <div className="space-y-6">
    <Alert variant="warning">Prévia de desenvolvimento. Use somente dados fictícios. Perguntas cuja aplicabilidade ainda não foi definida permanecem bloqueadas.</Alert>
    <Card><p className="text-muted">Suas respostas são individuais. O vínculo do casal não permite ao outro cônjuge ler suas respostas.</p>
      <div className="mt-4"><ProgressBar value={Math.round(session.answered / 200 * 100)} label={`${session.answered} de 200 respostas registradas`} /></div>
      <p className="mt-2 text-sm text-muted">{session.blocked} perguntas aguardam condições ou regras de aplicabilidade.</p></Card>
    <label className="block text-sm font-semibold">Ir para pergunta
      <select className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface p-3" value={index} disabled={pending} onChange={e => { setIndex(Number(e.target.value)); setMessage(""); }}>
        {session.questions.map((question, i) => <option key={question.id} value={i}>{question.id} — {question.title}</option>)}
      </select>
    </label>
    <Card className="space-y-5">
      <div className="flex justify-between gap-3"><Badge>{q.id}</Badge><span className="text-sm text-muted">{q.period}</span></div>
      <h2 className="text-xl font-semibold text-brand-strong">{q.title}</h2>
      {q.contextFields.map(field => <label className="block" key={field}>{contextLabels[field] ?? "Contexto individual"}
        <select className="mt-2 min-h-12 w-full rounded-xl border border-line p-3" disabled={closed || pending} value={session.context[field] === true ? "yes" : session.context[field] === false ? "no" : "unknown"} onChange={e => {
          const value = e.target.value === "unknown" ? null : e.target.value === "yes";
          start(async () => { try { const result = await saveContractContextAction({ sessionId: session.id, revision: session.revision, context: { [field]: value } }); setMessage(result.message); if (result.ok) router.refresh(); } catch { setMessage("Não foi possível salvar o contexto."); } });
        }}><option value="unknown">Ainda não informado</option><option value="yes">Sim</option><option value="no">Não</option></select>
      </label>)}
      {q.state === "BLOCKED_BY_POLICY" ? <Alert>Esta pergunta aguarda uma regra de aplicabilidade ou a definição do seu contexto. Nenhuma resposta será presumida.</Alert>
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
      <ContractActionButton action={() => consentContractAction(session.id, session.revision, !session.consented)}>{session.consented ? "Revogar autorização" : "Autorizar avaliação do casal"}</ContractActionButton>
    </> : <><p>Concluir encerra a edição desta versão das respostas. A avaliação do casal exige uma autorização separada de cada pessoa.</p>
      <ContractActionButton disabled={pending || session.blocked > 0} action={() => submitContractAction(session.id, session.revision)}>Concluir minhas respostas</ContractActionButton>
    </>}</Card>
  </div>;
}
