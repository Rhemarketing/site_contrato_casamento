import { Card, Alert } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService } from "@/services/contract.service";
import { ContractError } from "@/features/contract/domain/engine";
import { DocumentControls } from "@/features/contract/components/document-controls";
import { ContractNextSteps } from "@/features/contract/components/next-steps";

export default async function ContractDocumentPage() {
  const user = await requireUser("/contrato/documento");
  let draft = null;
  try { draft = await new ContractService(db).getDraft(user.id); }
  catch (error) { if (!(error instanceof ContractError)) throw error; }
  const acceptances = draft ? await new ContractService(db).documentAcceptances(user.id, draft.contentHash) : [];
  return <div className="contract-print space-y-6"><h2 className="font-serif text-3xl text-brand-strong">Nosso contrato</h2>
    {draft ? <><article className="space-y-6"><Alert>Contrato gerado com sucesso. O documento está pronto para leitura, download em PDF e impressão.</Alert>{draft.sections.map(section => <Card key={section.id}><h3 className="mb-4 text-xl font-semibold">{section.title}</h3>{section.paragraphs.map((p, i) => <p key={i} className="mb-3 whitespace-pre-wrap">{p}</p>)}</Card>)}</article><Card className="space-y-3"><p className="break-all text-sm">Versão {draft.version} · identificação do texto: {draft.contentHash}</p><DocumentControls hash={draft.contentHash} ownAccepted={acceptances.some(a => a.own)} /></Card></> : <Alert>O contrato ainda não foi gerado. Os dois cônjuges precisam concluir o questionário de 200 perguntas para que o contrato seja montado automaticamente.</Alert>}
    {draft?.amendment ? <Card><p>Motivo desta revisão: {draft.amendment.reason}</p><p className="break-all text-sm">Versão anterior: {draft.amendment.previousHash}</p></Card> : null}
    <div className="no-contract-print space-y-6">{!draft ? <ContractNextSteps /> : null}</div>
  </div>;
}
