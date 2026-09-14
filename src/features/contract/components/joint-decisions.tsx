"use client";
import { useState } from "react";
import { Card } from "@/components/ui";
import type { JointDecisionDto } from "@/services/contract.service";
import type { Letter } from "../domain/types";
import { FINANCIAL_CATEGORIES } from "../domain/decisions";
import { confirmContractDecisionAction, proposeContractDecisionAction, withdrawExtraContractDecisionAction } from "@/app/actions/contract.actions";
import { ContractActionButton } from "./action-button";
import { DecisionFields } from "./decision-fields";

function Decision({ definition }: { definition: JointDecisionDto }) {
  const [choice, setChoice] = useState<Letter | null>(definition.proposal?.choice ?? null);
  const [parameters, setParameters] = useState<Record<string, string[]>>(definition.proposal?.parameters ?? {});
  const option = definition.options.find(o => o.code === choice);
  return <Card className="space-y-4"><h2 className="text-xl font-semibold">{definition.prompt}</h2>
    <fieldset className="space-y-3"><legend className="sr-only">Proposta de decisão</legend>{definition.options.map(o => <label key={o.code} className="flex gap-3"><input type="radio" name={definition.id} checked={choice === o.code} onChange={() => { setChoice(o.code); setParameters({}); }} />{o.text}</label>)}</fieldset>
    {definition.fieldDefinitions ? <DecisionFields fields={option?.fields ?? []} definitions={definition.fieldDefinitions} values={parameters} change={setParameters} /> : option?.fields.map(field => <fieldset key={field} className="space-y-2"><legend>{field}</legend>{FINANCIAL_CATEGORIES.map(category => <label key={category} className="mr-4 inline-flex gap-2"><input type="checkbox" checked={parameters[field]?.includes(category) ?? false} onChange={e => setParameters({ ...parameters, [field]: e.target.checked ? [...parameters[field] ?? [], category] : parameters[field]?.filter(c => c !== category) ?? [] })} />{category}</label>)}</fieldset>)}
    <ContractActionButton disabled={!choice} action={() => proposeContractDecisionAction({ moduleId: definition.id, revision: definition.revision, choice, parameters })}>Registrar nova proposta</ContractActionButton>
    {definition.proposal && definition.hash ? <div className="space-y-3 border-t border-line pt-4"><p>Proposta registrada, versão {definition.revision}: {definition.options.find(o => o.code === definition.proposal?.choice)?.text}</p>
      {definition.preview ? definition.preview.map((paragraph, index) => <p key={index} className="whitespace-pre-wrap">{paragraph}</p>) : Object.entries(definition.proposal.parameters).map(([key, value]) => <p key={key}>{key}: {value.join(", ")}</p>)}
      <p>{definition.status === "CONFIRMED_BY_BOTH" ? "Confirmada pelos dois." : definition.status === "NO_CONSENSUS" ? "Sem consenso. Registrem uma nova proposta quando desejarem." : "Aguardando confirmação da mesma proposta."}</p>
      <ContractActionButton disabled={definition.ownConfirmed || definition.status === "NO_CONSENSUS"} action={() => confirmContractDecisionAction(definition.id, definition.hash!, true)}>Confirmar a proposta registrada</ContractActionButton>
      <ContractActionButton disabled={definition.status === "NO_CONSENSUS"} action={() => confirmContractDecisionAction(definition.id, definition.hash!, false)}>Registrar ausência de consenso</ContractActionButton>
      {definition.id.includes(":") ? <ContractActionButton action={() => withdrawExtraContractDecisionAction(definition.id, definition.hash!)}>Retirar esta proposta adicional</ContractActionButton> : null}
    </div> : null}
  </Card>;
}
export function JointDecisions({ modules }: { modules: JointDecisionDto[] }) {
  const [extra, setExtra] = useState<JointDecisionDto[]>([]);
  const definitions = [...modules, ...extra.filter(e => !modules.some(m => m.id === e.id))];
  return <div className="space-y-6">{definitions.map(m => <div key={m.id} className="space-y-3"><Decision key={`${m.id}:${m.revision}:${m.status}`} definition={m} />{m.repeatable && !m.id.includes(":") ? <button type="button" className="text-brand underline" onClick={() => setExtra([...extra, { ...m, id: `${m.id}:${crypto.randomUUID()}`, revision: 0, proposal: null, preview: undefined, hash: null, status: "OPEN", ownConfirmed: false }])}>Adicionar outro acordo deste tipo, filho ou situação</button> : null}</div>)}</div>;
}
