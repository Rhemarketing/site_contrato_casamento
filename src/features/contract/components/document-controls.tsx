"use client";
import { useState } from "react";
import { Button } from "@/components/ui";
import { acceptContractDocumentAction, deleteContractDataAction, generateContractAction } from "@/app/actions/contract.actions";
import { ContractActionButton } from "./action-button";
export function DocumentControls({ hash, ownAccepted }: { hash: string; ownAccepted: boolean }) {
  const [read, setRead] = useState(false);
  return <div className="no-contract-print space-y-4"><p>O aceite registra ciência dos compromissos de convivência no texto desta versão. Não é assinatura qualificada nem garantia de efeitos jurídicos. Alterações exigem novos aceites. Consentimento físico e sexual continua necessário em cada ocasião.</p><label className="flex gap-3"><input type="checkbox" checked={read} onChange={e => setRead(e.target.checked)} />Li integralmente esta versão e confirmo os compromissos e acordos nela registrados.</label><ContractActionButton disabled={!read || ownAccepted} action={() => acceptContractDocumentAction(hash)}>{ownAccepted ? "Meu aceite está registrado" : "Registrar meu aceite desta versão"}</ContractActionButton><Button variant="secondary" onClick={() => window.print()}>Imprimir ou salvar PDF</Button></div>;
}
export function PrepareDocument() {
  const [reason, setReason] = useState("");
  return <div className="space-y-3"><label className="block">Motivo da revisão, se já existe uma versão aceita<input className="mt-1 min-h-11 w-full rounded-lg border border-line p-3" maxLength={300} value={reason} onChange={e => setReason(e.target.value)} /></label><ContractActionButton action={() => generateContractAction(reason)}>Preparar ou atualizar rascunho</ContractActionButton><a className="block text-brand underline" href="/contrato/historico">Consultar versões aceitas e alterações</a></div>;
}
export function DeleteContractData() {
  const [text, setText] = useState("");
  return <div className="space-y-4"><h3 className="text-xl font-semibold">Excluir meus dados do produto</h3><p>Remove suas respostas, revisões autorizadas e registros individuais. Também remove propostas, contratos e aceites derivados do casal. As respostas privadas do outro cônjuge, a prova de admissão e sua aquisição permanecem. Esta exclusão não pode ser desfeita pelo site.</p><label className="block">Digite EXCLUIR MEUS DADOS<input className="mt-1 min-h-11 w-full rounded-lg border border-line p-3" value={text} onChange={e => setText(e.target.value)} /></label><ContractActionButton disabled={text !== "EXCLUIR MEUS DADOS"} action={() => deleteContractDataAction(text)}>Excluir meus dados do contrato</ContractActionButton></div>;
}
