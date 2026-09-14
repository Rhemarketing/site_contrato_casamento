"use client";
import { useState } from "react";
import { Card } from "@/components/ui";
import type { ContractService } from "@/services/contract.service";
import { proposeContractFundAction, confirmContractFundAction } from "@/app/actions/contract.actions";
import { ContractActionButton } from "./action-button";
export function ContractFund({ fund }: { fund: Awaited<ReturnType<ContractService["getFund"]>> }) {
  const [reference, setReference] = useState("");
  const [process, setProcess] = useState("CONVERSA_GERAL");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  if (!fund.available) return <Card><p>O cofrinho voluntário estará disponível após o aceite do mesmo contrato pelos dois e enquanto a área conjunta estiver disponível.</p></Card>;
  const labels = { refusalOfAgreedProcess: "O registro se refere à recusa injustificada de participar de um processo previamente acordado.", noLegitimateImpediment: "Não houve impedimento legítimo, risco ou dúvida sobre a possibilidade de participação.", noExcludedContext: "Não envolve sexo, falta de desejo, saúde, violência, coerção, recaída, dependência, fé ou simples discordância.", voluntary: "Desejo propor voluntariamente este registro, sujeito à confirmação expressa dos dois e à contestação." };
  return <Card className="space-y-5"><h3 className="text-xl font-semibold">Cofrinho de reconexão</h3><p>Registro voluntário de R$ 10,00. O site não cobra, transfere dinheiro nem cria débito. Discordar ou contestar suspende o registro. Contribuir não substitui a conversa ou a correção.</p><p>Total confirmado: {(fund.totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
    <label className="block">Processo<select className="mt-1 min-h-11 w-full rounded-lg border border-line p-3" value={process} onChange={e => setProcess(e.target.value)}><option value="CONVERSA_GERAL">Conversa geral previamente acordada</option><option value="REEQUILIBRIO_TEMPO">Reequilíbrio do tempo do casal</option><option value="REVISAO_ACORDO">Revisão de um acordo</option></select></label><label className="block">Referência breve do processo (será compartilhada)<input className="mt-1 min-h-11 w-full rounded-lg border border-line p-3" maxLength={160} value={reference} onChange={e => setReference(e.target.value)} /></label>
    {Object.entries(labels).map(([id, label]) => <label key={id} className="flex gap-3"><input type="checkbox" checked={checks[id] ?? false} onChange={e => setChecks({ ...checks, [id]: e.target.checked })} />{label}</label>)}
    <ContractActionButton disabled={!reference.trim() || Object.keys(labels).some(id => !checks[id])} action={() => proposeContractFundAction({ documentHash: fund.documentHash, process, reference, ...checks })}>Propor registro de R$ 10,00</ContractActionButton>
    {fund.entries.map(entry => <div key={entry.id} className="space-y-3 border-t border-line pt-4"><p>{entry.reference} — R$ 10,00</p><p>{entry.status === "CONFIRMED" ? "Confirmado pelos dois" : entry.status === "CONTESTED" ? "Contestado: suspenso, fora do total" : "Aguardando confirmação dos dois"}</p><ContractActionButton disabled={entry.ownConfirmed || entry.status === "CONTESTED"} action={() => confirmContractFundAction(entry.id, entry.hash, true)}>Confirmar voluntariamente</ContractActionButton><ContractActionButton disabled={entry.status === "CONTESTED"} action={() => confirmContractFundAction(entry.id, entry.hash, false)}>Contestar e suspender</ContractActionButton></div>)}
  </Card>;
}
