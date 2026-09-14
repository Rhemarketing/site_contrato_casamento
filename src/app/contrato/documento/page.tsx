import { Card, Alert } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService, NEUTRAL_SHARED_STATE } from "@/services/contract.service";
import { ContractError } from "@/features/contract/domain/engine";
import { DocumentControls, PrepareDocument } from "@/features/contract/components/document-controls";

export default async function ContractDocumentPage() {
  const user = await requireUser("/contrato/documento");
  let draft = null;
  try { draft = await new ContractService(db).getDraft(user.id); }
  catch (error) { if (!(error instanceof ContractError)) throw error; }
  const acceptances = draft ? await new ContractService(db).documentAcceptances(user.id, draft.contentHash) : [];
  return <div className="contract-print space-y-6"><h2 className="font-serif text-3xl text-brand-strong">Nosso contrato</h2>
    {draft ? <><article className="space-y-6"><Alert>{acceptances.length === 2 ? "Texto com ciência e aceite registrados pelos dois." : "Rascunho para leitura e aceite individual dos dois."}</Alert>{draft.sections.map(section => <Card key={section.id}><h3 className="mb-4 text-xl font-semibold">{section.title}</h3>{section.paragraphs.map((p, i) => <p key={i} className="mb-3 whitespace-pre-wrap">{p}</p>)}</Card>)}</article><Card className="space-y-3"><p className="break-all text-sm">Versão {draft.version} · identificação do texto: {draft.contentHash}</p>{acceptances.map(a => <p key={a.name + a.at}>Aceite de {a.name}: {new Date(a.at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} (Brasília).</p>)}<DocumentControls hash={draft.contentHash} ownAccepted={acceptances.some(a => a.own)} /></Card></> : <Alert>{NEUTRAL_SHARED_STATE.message}</Alert>}
    {draft?.amendment ? <Card><p>Motivo desta revisão: {draft.amendment.reason}</p><p className="break-all text-sm">Versão anterior: {draft.amendment.previousHash}</p></Card> : null}
    <div className="no-contract-print"><PrepareDocument /></div>
  </div>;
}
