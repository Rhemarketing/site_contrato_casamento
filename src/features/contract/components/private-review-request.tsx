"use client";
import { useState } from "react";
import { requestContractReviewAction } from "@/app/actions/contract.actions";
import { ContractActionButton } from "./action-button";

export function PrivateReviewRequest({ reviewers, q181 }: { reviewers: { id: string; name: string | null }[]; q181: boolean }) {
  const [reviewer, setReviewer] = useState("");
  const [q151, setQ151] = useState(false);
  const [consent, setConsent] = useState(false);
  return <div className="space-y-4"><label className="block">Escolha quem poderá revisar<select className="mt-2 min-h-12 w-full rounded-xl border border-line p-3" value={reviewer} onChange={e => { setReviewer(e.target.value); setConsent(false); }}><option value="">Selecione uma pessoa</option>{reviewers.map(r => <option key={r.id} value={r.id}>{r.name ?? "Revisor habilitado"}</option>)}</select></label>
    <label className="flex gap-3"><input type="checkbox" checked={q151} onChange={e => { setQ151(e.target.checked); setConsent(false); }} />Também solicito revisão para um acordo voluntário sobre bebidas e autorizo incluir minha resposta Q151. Essa revisão é exigida de todos que escolherem esse acordo, independentemente da resposta.</label>
    <p>Serão compartilhados somente com essa pessoa: seu nome, respostas Q101–Q110, Q119 e seu complemento, Q162, relato de compressão do pescoço e os contextos de responsabilidade parental. {q181 ? "Também serão compartilhados os contextos de quebra conhecida de confiança, reconstrução escolhida e o complemento privado da Q081, se respondido." : null} Você pode revogar esse acesso aqui. Isso não envia respostas ao seu cônjuge.</p>
    <label className="flex gap-3"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />Autorizo a pessoa selecionada a acessar esses dados para revisar a possibilidade de continuar com segurança.</label>
    <ContractActionButton disabled={!reviewer || !consent} action={() => requestContractReviewAction(reviewer, consent, q151)}>Solicitar revisão privada</ContractActionButton>
  </div>;
}
