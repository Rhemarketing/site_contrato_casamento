import { Card, Alert } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService, NEUTRAL_SHARED_STATE } from "@/services/contract.service";
import { ContractError } from "@/features/contract/domain/engine";
import { ContractActionButton } from "@/features/contract/components/action-button";
import { generateContractAction } from "@/app/actions/contract.actions";

export default async function ContractDocumentPage() {
  const user = await requireUser("/contrato/documento");
  let draft = null;
  try { draft = await new ContractService(db).getDraft(user.id); }
  catch (error) { if (!(error instanceof ContractError)) throw error; }
  return <div className="space-y-6"><h2 className="font-serif text-3xl text-brand-strong">Nosso contrato</h2>
    {draft ? <article className="space-y-6"><Alert>Rascunho para leitura. Este registro não constitui assinatura nem afirma validade jurídica automática.</Alert>{draft.sections.map(section => <Card key={section.id}><h3 className="mb-4 text-xl font-semibold">{section.title}</h3>{section.paragraphs.map((p, i) => <p key={i} className="mb-3 whitespace-pre-wrap">{p}</p>)}</Card>)}</article> : <Alert>{NEUTRAL_SHARED_STATE.message}</Alert>}
    <ContractActionButton action={generateContractAction}>Verificar disponibilidade do rascunho</ContractActionButton>
  </div>;
}
