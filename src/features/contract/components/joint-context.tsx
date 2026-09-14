"use client";
import { useState } from "react";
import { Card } from "@/components/ui";
import type { JointFactsDto } from "../domain/joint-facts";
import type { Facts } from "../domain/types";
import { ContractActionButton } from "./action-button";
import { saveContractJointFactsAction } from "@/app/actions/contract.actions";

export function JointContext({ facts }: { facts: JointFactsDto }) {
  const [values, setValues] = useState<Facts>(facts.own);
  return <Card className="space-y-4"><h3 className="text-xl font-semibold">Situações para nossos acordos</h3><p>Estas informações são compartilhadas por sua escolha. Cada pessoa confirma sua própria posição. Um fato só será utilizado quando os dois confirmarem a mesma informação; silêncio e divergência não equivalem a “não”. Alterar esse contexto exige novas confirmações dos acordos.</p>
    <details><summary className="cursor-pointer font-semibold text-brand">Conferir situações do casal</summary><div className="mt-4 space-y-4">{facts.fields.map(field => <label className="block" key={field.id}>{field.label}<select className="mt-1 min-h-11 w-full rounded-lg border border-line bg-surface p-2" value={typeof values[field.id] === "boolean" ? String(values[field.id]) : "unknown"} onChange={e => setValues({ ...values, [field.id]: e.target.value === "unknown" ? null : e.target.value === "true" })}><option value="unknown">Não informado / precisamos conversar</option><option value="true">Sim</option><option value="false">Não</option></select><span className="text-sm text-muted">{typeof facts.agreed[field.id] === "boolean" ? `Informação confirmada pelos dois: ${facts.agreed[field.id] ? "sim" : "não"}.` : "Ainda sem confirmação conjunta."}</span></label>)}</div></details>
    <ContractActionButton action={() => saveContractJointFactsAction(facts.revision, values)}>Compartilhar e confirmar estas informações</ContractActionButton>
  </Card>;
}
