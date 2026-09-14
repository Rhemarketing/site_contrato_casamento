import { Alert, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService } from "@/services/contract.service";
import { ContractError } from "@/features/contract/domain/engine";
export default async function ContractHistoryPage() {
  const user = await requireUser("/contrato/historico");
  let history: Awaited<ReturnType<ContractService["documentHistory"]>> = [];
  try { history = await new ContractService(db).documentHistory(user.id); }
  catch (error) { if (!(error instanceof ContractError)) throw error; }
  return <div className="space-y-6"><h2 className="text-2xl font-semibold">Histórico de versões aceitas</h2><p>Uma proposta nova não substitui o acordo anterior sem novos aceites dos dois. Segurança, consentimento e impossibilidade de cumprimento prevalecem. O histórico não autoriza exigir o cumprimento de uma cláusula insegura.</p>
    {!history.length ? <Alert>Não há versões aceitas disponíveis nesta etapa.</Alert> : history.map(entry => <Card key={entry.id} className="space-y-4"><h3 className="text-xl font-semibold">Versão de {new Date(entry.date).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</h3><p className="break-all text-sm">{entry.draft.contentHash}</p>{entry.acceptances.map((ack, i) => <p key={i}>Aceite de {ack.name}: {new Date(ack.at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>)}
      {entry.draft.amendment ? <p>Motivo: {entry.draft.amendment.reason}</p> : null}
      {entry.draft.sections.map(section => <details key={section.id}><summary className="cursor-pointer font-semibold">{section.title}{entry.draft.amendment?.changedSectionIds.includes(section.id) ? " — alterada nesta versão" : ""}</summary>{section.paragraphs.map((p, i) => <p key={i} className="mt-3 whitespace-pre-wrap">{p}</p>)}</details>)}
    </Card>)}
  </div>;
}
