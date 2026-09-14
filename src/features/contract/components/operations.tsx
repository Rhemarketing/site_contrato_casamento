"use client";
import { useState } from "react";
import { Card } from "@/components/ui";
import { ContractActionButton } from "./action-button";
import { deleteContractRecordAction, saveContractRecordAction } from "@/app/actions/contract.actions";
import { EMERGENCY_FIELDS, localDateTimeToInstant, localParts, PLAN_LIMITS, PROTOCOLS, TIME_ZONE, type ContractEvent, type OwnRecord } from "../domain/operations";
import type { ContractService } from "@/services/contract.service";

type Area = Awaited<ReturnType<ContractService["getOperations"]>>;
const style = "mt-1 min-h-11 w-full rounded-lg border border-line bg-surface px-3 py-2";
function Input({ label, value, set, type = "text" }: { label: string; value: string; set: (value: string) => void; type?: string }) { return <label className="block">{label}<input className={style} type={type} value={value} maxLength={300} onChange={e => set(e.target.value)} /></label>; }
function Check({ label, value, set }: { label: string; value: boolean; set: (value: boolean) => void }) { return <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" checked={value} onChange={e => set(e.target.checked)} />{label}</label>; }
function localInput(at: string, zone: string) { const p = localParts(at, zone); const pad = (n: number) => String(n).padStart(2, "0"); return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`; }
async function save(revision: number, make: () => unknown) { try { return await saveContractRecordAction(revision, make()); } catch { return { ok: false, message: "Confira os campos e as datas antes de salvar." }; } }

function Emergency({ area }: { area: Area }) {
  const existing = area.own.find(r => r.data.kind === "EMERGENCY");
  const [fields, setFields] = useState<Record<string, { value: string; shared: boolean }>>(existing?.data.kind === "EMERGENCY" ? existing.data.fields : {});
  return <Card className="space-y-4"><h3 className="text-xl font-semibold">Registro Familiar de Emergência</h3><p>Opcional. Informe apenas o necessário para auxílio em uma emergência. Não envie documentos, exames ou detalhes clínicos. Marque separadamente o que deseja compartilhar. Você pode alterar ou remover os dados.</p>{Object.entries(EMERGENCY_FIELDS).map(([id, label]) => <div key={id} className="space-y-2"><Input label={label} value={fields[id]?.value ?? ""} set={value => setFields({ ...fields, [id]: { value, shared: fields[id]?.shared ?? false } })} /><Check label="Autorizo compartilhar este campo com meu cônjuge na área do casal" value={fields[id]?.shared ?? false} set={shared => setFields({ ...fields, [id]: { value: fields[id]?.value ?? "", shared } })} /></div>)}
    <ContractActionButton action={() => save(existing?.revision ?? 0, () => ({ kind: "EMERGENCY", fields: Object.fromEntries(Object.entries(fields).filter(([, field]) => field.value.trim())) }))}>Salvar minhas informações</ContractActionButton>
    {existing ? <ContractActionButton action={() => deleteContractRecordAction(existing.id, existing.revision)}>Remover minhas informações de emergência</ContractActionButton> : null}
    {area.sharedEmergency.length ? <div className="space-y-2 border-t border-line pt-4"><h4 className="font-semibold">Informações que seu cônjuge autorizou compartilhar</h4>{area.sharedEmergency.map(field => <p key={field.label}>{field.label}: {field.value}</p>)}</div> : null}
  </Card>;
}
function Plan({ area }: { area: Area }) {
  const existing = area.own.find(r => r.data.kind === "PLAN");
  const data = existing?.data.kind === "PLAN" ? existing.data : null;
  const [intensity, setIntensity] = useState<"LIGHT" | "MODERATE" | "FULL">(data?.intensity ?? (area.ownLimit === 1 ? "LIGHT" : area.ownLimit === 2 ? "MODERATE" : "FULL"));
  const [priorities, setPriorities] = useState(data?.priorities.join("\n") ?? "");
  const [secondary, setSecondary] = useState(data?.secondary.join("\n") ?? "");
  const [review, setReview] = useState(data ? localInput(data.reviewAt, area.timeZone) : "");
  const limit = Math.min(area.ownLimit, PLAN_LIMITS[intensity]);
  return <Card className="space-y-4"><h3 className="text-xl font-semibold">Meu plano individual</h3><p>Este plano é privado. Escolha ações concretas e compatíveis com sua disponibilidade atual.</p><label className="block">Ritmo<select className={style} value={intensity} onChange={e => setIntensity(e.target.value as typeof intensity)}><option value="LIGHT">Leve: até 1 prioridade e 1 ação secundária</option>{area.ownLimit >= 2 ? <option value="MODERATE">Moderado: até 2 prioridades e 2 ações secundárias</option> : null}{area.ownLimit >= 3 ? <option value="FULL">Completo: até 3 prioridades e 3 ações secundárias</option> : null}</select></label>
    <label className="block">Prioridades: uma por linha, até {limit}<textarea className={style} rows={3} value={priorities} onChange={e => setPriorities(e.target.value)} /></label><label className="block">Ações secundárias: uma por linha, até {limit}<textarea className={style} rows={3} value={secondary} onChange={e => setSecondary(e.target.value)} /></label><Input label={`Data de revisão (${area.timeZone})`} type="datetime-local" value={review} set={setReview} />
    <ContractActionButton action={() => save(existing?.revision ?? 0, () => ({ kind: "PLAN", intensity, priorities: priorities.split("\n").map(s => s.trim()).filter(Boolean), secondary: secondary.split("\n").map(s => s.trim()).filter(Boolean), reviewAt: localDateTimeToInstant(review, area.timeZone) }))}>Salvar plano individual</ContractActionButton>
  </Card>;
}
function Timing({ area }: { area: Area }) {
  const existing = area.own.find(r => r.data.kind === "TIMING");
  const data = existing?.data.kind === "TIMING" ? existing.data : null;
  const [zone, setZone] = useState(data?.timeZone ?? TIME_ZONE);
  const [anchor, setAnchor] = useState(data ? localInput(data.anchor, zone) : "");
  return <Card className="space-y-4"><h3 className="text-xl font-semibold">Agenda unificada do casal</h3><p>Confirmem a mesma data de referência, horário e fuso para organizar as revisões periódicas. Prazos urgentes continuam no acompanhamento individual e não são adiados pela agenda.</p><Input label="Fuso horário IANA" value={zone} set={setZone} /><Input label="Data e horário de referência" type="datetime-local" value={anchor} set={setAnchor} />
    {area.partnerTiming ? <button type="button" className="text-brand underline" onClick={() => { setZone(area.partnerTiming!.timeZone); setAnchor(localInput(area.partnerTiming!.anchor, area.partnerTiming!.timeZone)); }}>Usar a referência compartilhada pelo cônjuge: {localInput(area.partnerTiming.anchor, area.partnerTiming.timeZone).replace("T", " ")} ({area.partnerTiming.timeZone})</button> : null}
    <ContractActionButton action={() => save(existing?.revision ?? 0, () => ({ kind: "TIMING", timeZone: zone, anchor: localDateTimeToInstant(anchor, zone) }))}>Compartilhar e confirmar referência da agenda</ContractActionButton><p>{area.timingAgreed ? "Referência confirmada pelos dois." : "Aguardando a mesma confirmação dos dois."}</p>
    {Object.entries(Object.groupBy(area.calendar, item => item.at)).map(([at, items]) => <div key={at} className="border-t border-line pt-3"><p className="font-semibold">{new Date(at).toLocaleString("pt-BR", { timeZone: area.timeZone })}</p>{items?.map(item => <p key={item.id}>{item.title}</p>)}</div>)}
  </Card>;
}

const eventNames: Record<ContractEvent["type"], string> = { ISSUE: "Assunto importante para conversar", PATTERN: "Repetição do mesmo comportamento causando conflito", INCOME: "Alteração da minha renda líquida individual", AFFECTION: "Aproximação afetiva ou íntima", CYCLE: "Ciclo completo de frequência", QUALITY: "Momento de qualidade", FINANCE: "Situação financeira", CONVERSATION: "Conversa estruturada realizada", TRUST: "Reconstrução de confiança já conhecida", HABIT: "Plano de proteção de hábito", REVIEW: "Revisão de um protocolo" };
const outcomeLabels = { DECLINED: "Recusada", ACCEPTED: "Aceita", CANCELLED: "Cancelado", COMPLETED: "Realizado / completo", MELHOROU: "Melhorou suficientemente", PARCIAL: "Melhora parcial", SEM_MELHORA: "Sem melhora suficiente" };
const outcomes: Record<ContractEvent["type"], ContractEvent["outcome"][]> = { ISSUE: ["SEM_MELHORA"], PATTERN: ["SEM_MELHORA"], INCOME: ["COMPLETED"], AFFECTION: ["DECLINED", "ACCEPTED"], CYCLE: ["COMPLETED"], QUALITY: ["CANCELLED", "COMPLETED"], FINANCE: ["SEM_MELHORA"], CONVERSATION: ["MELHOROU", "PARCIAL", "SEM_MELHORA"], TRUST: ["SEM_MELHORA"], HABIT: ["SEM_MELHORA"], REVIEW: ["MELHOROU", "PARCIAL", "SEM_MELHORA"] };
function EventForm({ area }: { area: Area }) {
  const [id] = useState(area.newEventId);
  const [newTopicId] = useState(area.newTopicId);
  const [topicId, setTopicId] = useState<string>(newTopicId);
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<ContractEvent["type"]>("ISSUE");
  const [outcome, setOutcome] = useState<ContractEvent["outcome"]>("SEM_MELHORA");
  const [at, setAt] = useState(""); const [impediment, setImpediment] = useState(false);
  const [safe, setSafe] = useState(false); const [known, setKnown] = useState(false);
  const [avoidable, setAvoidable] = useState(false); const [rescheduled, setRescheduled] = useState(false);
  const [action, setAction] = useState(""); const [review, setReview] = useState("");
  const [protocol, setProtocol] = useState<NonNullable<ContractEvent["protocol"]>>("P01");
  const [numbers, setNumbers] = useState<Record<string, string>>({}); const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [cycleUnit, setCycleUnit] = useState<NonNullable<ContractEvent["cycle"]>["unit"]>("WEEK"); const [anchor, setAnchor] = useState("");
  const topics = [...new Map(area.own.flatMap(r => r.data.kind === "EVENT" ? [[r.data.topicId, r.data.topic] as const] : [])).entries()];
  const number = (key: string) => numbers[key]?.trim() ? Number(numbers[key].replace(",", ".")) : undefined;
  return <Card className="space-y-4"><h3 className="text-xl font-semibold">Registrar ocorrência no meu acompanhamento</h3><p>Seus registros e lembretes são privados. Não registre detalhes íntimos, provas, diagnósticos ou dados de terceiros. Nenhum evento gera cobrança, dívida sexual ou envio automático ao cônjuge.</p>
    <label className="block">Assunto<select className={style} value={topicId} onChange={e => { setTopicId(e.target.value); setTopic(topics.find(([id]) => id === e.target.value)?.[1] ?? ""); }}><option value={newTopicId}>Novo assunto</option>{topics.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><Input label="Nome breve do assunto" value={topic} set={setTopic} />
    <label className="block">Tipo de registro<select className={style} value={type} onChange={e => { const next = e.target.value as typeof type; setType(next); setOutcome(outcomes[next][0]); }} >{Object.entries(eventNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><Input label={`Data e horário da ocorrência (${area.timeZone})`} type="datetime-local" value={at} set={setAt} />
    <label className="block">Resultado<select className={style} value={outcome} onChange={e => setOutcome(e.target.value as typeof outcome)}>{outcomes[type].map(value => <option key={value} value={value}>{outcomeLabels[value]}</option>)}</select></label><Check label="Houve impedimento legítimo, como saúde, risco ou circunstância inevitável" value={impediment} set={setImpediment} />
    {["ISSUE", "PATTERN", "CONVERSATION", "TRUST"].includes(type) ? <Check label="Considero possível abordar o assunto sem risco ou coerção" value={safe} set={setSafe} /> : null}
    {type === "TRUST" ? <Check label="A situação já é conhecida pelos dois e a reconstrução foi escolhida voluntariamente" value={known} set={setKnown} /> : null}
    {type === "QUALITY" ? <><Check label="Cancelamento por compromisso profissional evitável" value={avoidable} set={setAvoidable} /><Check label="O momento foi adequadamente remarcado" value={rescheduled} set={setRescheduled} /></> : null}
    {type === "INCOME" ? <><Input label="Renda líquida individual anterior (R$)" value={numbers.before ?? ""} set={v => setNumbers({ ...numbers, before: v })} /><Input label="Renda líquida individual atual (R$)" value={numbers.after ?? ""} set={v => setNumbers({ ...numbers, after: v })} /></> : null}
    {type === "FINANCE" ? <><div className="grid gap-4 md:grid-cols-2">{Object.entries({ previousIncome: "RLF anterior", currentIncome: "RLF atual", reserveBefore: "Reserva anterior", reserveUsed: "Reserva utilizada nesta situação", reserveAfter: "Reserva restante", essentialMonthly: "Despesas essenciais mensais" }).map(([id, label]) => <Input key={id} label={`${label} (R$)`} value={numbers[id] ?? ""} set={v => setNumbers({ ...numbers, [id]: v })} />)}</div>{Object.entries({ unemployment: "Houve desemprego", cannotPayEssential: "Não é possível pagar despesa essencial ou compromisso relevante", extraordinaryCredit: "Despesa extraordinária exigiu crédito ou nova dívida", workIncapacity: "Incapacidade temporária para o trabalho reduziu efetivamente a renda" }).map(([id, label]) => <Check key={id} label={label} value={checks[id] ?? false} set={v => setChecks({ ...checks, [id]: v })} />)}</> : null}
    {type === "CYCLE" ? <><p>Use a frequência consensualmente registrada. Informe somente ciclos completos. Não há reposição, acúmulo ou obrigação sexual.</p><Input label="Início do primeiro ciclo" type="datetime-local" value={anchor} set={setAnchor} /><label className="block">Frequência acordada<select className={style} value={cycleUnit} onChange={e => setCycleUnit(e.target.value as typeof cycleUnit)}><option value="WEEK">Semanal</option><option value="FORTNIGHT">A cada 15 dias</option><option value="MONTH">Mensal</option><option value="DAYS">Outro ciclo em dias</option><option value="NONE">Sem meta numérica</option></select></label>{[["index", "Número do ciclo completo (primeiro = 1)"], ["goal", "Meta acordada por ciclo (zero se não houver)"], ["actual", "Ocorrências neste ciclo"]].map(([id, label]) => <Input key={id} label={label} value={numbers[id] ?? ""} set={v => setNumbers({ ...numbers, [id]: v })} />)}{cycleUnit === "DAYS" ? <Input label="Duração acordada do ciclo em dias" value={numbers.days ?? ""} set={v => setNumbers({ ...numbers, days: v })} /> : null}<Check label="Percebo insatisfação com o afastamento neste período" value={checks.dissatisfied ?? false} set={v => setChecks({ ...checks, dissatisfied: v })} /></> : null}
    {type === "REVIEW" ? <label className="block">Protocolo original<select className={style} value={protocol} onChange={e => setProtocol(e.target.value as typeof protocol)}>{["P01", "P02", "P03", "P05", "P06", "P08", "P10", "P11"].map(id => <option key={id} value={id}>{PROTOCOLS[id as keyof typeof PROTOCOLS]}</option>)}</select></label> : null}
    {["CONVERSATION", "REVIEW"].includes(type) ? <><Input label="Ação concreta ou nova abordagem" value={action} set={setAction} /><Input label="Próxima revisão" type="datetime-local" value={review} set={setReview} /></> : null}
    <ContractActionButton action={() => save(0, () => ({ kind: "EVENT", id, topicId, topic, type, at: localDateTimeToInstant(at, area.timeZone), timeZone: area.timeZone, impediment, outcome, safeToDiscuss: safe, knownToBoth: known,
      ...(type === "QUALITY" ? { avoidable, rescheduled } : {}), ...(type === "INCOME" ? { income: { before: number("before"), after: number("after") } } : {}), ...(type === "REVIEW" ? { protocol } : {}),
      ...(["CONVERSATION", "REVIEW"].includes(type) ? { action, reviewAt: localDateTimeToInstant(review, area.timeZone) } : {}),
      ...(type === "FINANCE" ? { finance: { ...Object.fromEntries(["previousIncome", "currentIncome", "reserveBefore", "reserveUsed", "reserveAfter", "essentialMonthly"].map(key => [key, number(key)])), ...Object.fromEntries(["unemployment", "cannotPayEssential", "extraordinaryCredit", "workIncapacity"].map(key => [key, checks[key] ?? false])) } } : {}),
      ...(type === "CYCLE" ? { cycle: { anchor: localDateTimeToInstant(anchor, area.timeZone), unit: cycleUnit, days: cycleUnit === "DAYS" ? number("days") : 1, index: (number("index") ?? NaN) - 1, goal: number("goal"), actual: number("actual"), dissatisfied: checks.dissatisfied ?? false } } : {}),
    }))}>Salvar registro privado</ContractActionButton>
  </Card>;
}
export function ContractOperations({ area }: { area: Area }) {
  const showDate = (at: string) => new Date(at).toLocaleString("pt-BR", { timeZone: area.timeZone });
  return <div className="space-y-6"><Card className="space-y-4"><h3 className="text-xl font-semibold">Meu acompanhamento privado</h3>{area.tasks.length ? area.tasks.map(task => <div key={task.key} className="border-t border-line pt-3"><h4 className="font-semibold">{PROTOCOLS[task.protocol]} — {task.topic}</h4>{task.reopened ? <p>O protocolo original foi retomado após nova ocorrência.</p> : null}{task.dueAt ? <p>Prazo da conversa: {showDate(task.dueAt)}</p> : null}{task.reviewAt ? <p>Revisão: {showDate(task.reviewAt)}</p> : null}<p>Sem cobrança automática. Preserve consentimento e segurança.</p></div>) : <p>Sem lembretes derivados dos seus registros neste momento.</p>}</Card>
    {area.reminders.length ? <Card className="space-y-3"><h3 className="text-xl font-semibold">Meus lembretes</h3>{area.reminders.map(reminder => <p key={reminder.id}>{reminder.title} — {showDate(reminder.at)}</p>)}</Card> : null}
    {area.jointProtocols.map(id => { const protocol = area.protocols.find(p => p.id === id); return protocol ? <Card key={id}><h3 className="text-xl font-semibold">{protocol.title}</h3>{protocol.paragraphs.map((p, i) => <p key={i} className="mt-3">{p}</p>)}</Card> : null; })}
    <EventForm key={area.own.filter(r => r.data.kind === "EVENT").map(r => r.id + r.revision).join(":")} area={area} />
    <Card><details><summary className="cursor-pointer font-semibold">Meus registros anteriores</summary><div className="mt-4 space-y-4">{area.own.filter(r => r.data.kind === "EVENT").map(record => { const event = record.data as Extract<OwnRecord, { kind: "EVENT" }>; return <div key={record.id} className="space-y-2 border-t border-line pt-3"><p>{eventNames[event.type]} — {event.topic} — {showDate(event.at)} — {outcomeLabels[event.outcome]}</p><ContractActionButton action={() => deleteContractRecordAction(record.id, record.revision)}>Remover este registro privado</ContractActionButton></div>; })}</div></details></Card>
    <Timing key={area.own.find(r => r.data.kind === "TIMING")?.revision ?? 0} area={area} /><Plan key={area.own.find(r => r.data.kind === "PLAN")?.revision ?? 0} area={area} /><Emergency key={area.own.find(r => r.data.kind === "EMERGENCY")?.revision ?? 0} area={area} />
    <Card className="space-y-4"><h3 className="text-xl font-semibold">Roteiros do Método</h3><p>Biblioteca disponível a todos para consulta individual. Um roteiro não determina que o fato aconteceu, não impõe contato físico e não supera impedimento legítimo ou cuidado de segurança.</p>{[...area.protocols, ...area.reviewGuides].map(guide => <details key={guide.id} id={`protocol-${guide.id}`}><summary className="cursor-pointer font-semibold">{guide.id} — {guide.title}</summary>{guide.paragraphs.map((p, i) => <p key={i} className="mt-3">{p}</p>)}</details>)}</Card>
  </div>;
}
