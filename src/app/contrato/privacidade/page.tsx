import Link from "next/link";
import { Alert, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService } from "@/services/contract.service";
import { ContractError } from "@/features/contract/domain/engine";
import { PrivateReviewRequest } from "@/features/contract/components/private-review-request";
import { ContractActionButton } from "@/features/contract/components/action-button";
import { revokeContractReviewAction } from "@/app/actions/contract.actions";
import { DeleteContractData } from "@/features/contract/components/document-controls";

export default async function PrivacyPage() {
  const user = await requireUser("/contrato/privacidade");
  let area;
  try { area = await new ContractService(db).privateArea(user.id); }
  catch (e) { if (!(e instanceof ContractError)) throw e; }
  const status: Record<string, string> = { REQUESTED: "Solicitada", CONTINUE: "Revisada: continuação permitida", PAUSE: "Pausada para cuidado individual", CLOSE: "Revisão encerrada", REVOKED: "Autorização revogada", OUTDATED: "Respostas alteradas: nova revisão necessária" };
  return <div className="space-y-6"><h2 className="text-2xl font-semibold">Minha privacidade e cuidado individual</h2><Card className="space-y-4"><p>Esta página é individual. Você decide se deseja solicitar uma revisão. O outro cônjuge não recebe seu relato nem o motivo de uma etapa conjunta permanecer indisponível.</p>
    {!area ? <Link href="/contrato" className="text-brand underline">Iniciar minha sessão</Link> : <>
      {area.safety.critical ? <Alert variant="warning">O fluxo conjunto permanece pausado. Priorize sua segurança e procure apoio individual adequado à sua situação. Uma revisão não permite ultrapassar um alerta crítico ativo.</Alert> : area.safety.reviewRequired || area.q181 ? <Alert>Este assunto precisa de revisão privada antes da continuação conjunta. Você pode continuar as outras perguntas na sua área individual.</Alert> : <p>Uma revisão privada pode ser solicitada se você precisar. A ausência de alerta registrado não certifica a segurança de uma relação.</p>}
      {area.reviewers.length ? <PrivateReviewRequest reviewers={area.reviewers} q181={area.q181} /> : <Alert>Nenhum revisor está disponível para sua conta neste momento. Suas respostas permanecem privadas.</Alert>}
      {area.guidance.length ? <details><summary className="cursor-pointer font-semibold">Minhas orientações individuais do Método</summary><p className="mt-3">Textos privados para sua reflexão. Não representam acordo ou aceite do cônjuge. Nenhuma orientação exige exposição ou conversa quando houver risco; use a revisão privada se precisar.</p>{area.guidance.map(item => <section key={item.id} className="mt-4"><h3 className="font-semibold">{item.title}</h3><p>{item.text}</p></section>)}</details> : null}
      {area.reviews.map(r => <div key={r.id} className="space-y-2 border-t border-line pt-3"><p>{status[r.status] ?? "Revisão registrada"} — {new Date(r.date).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>{r.status !== "REVOKED" ? <ContractActionButton action={revokeContractReviewAction.bind(null, r.id)}>Revogar acesso desta revisão</ContractActionButton> : null}</div>)}
    </>}
  </Card><Card className="space-y-5"><p>Espaços sem documento aceito pelos dois são removidos após 180 dias sem alterações. Documentos aceitos e seu histórico permanecem até a exclusão solicitada pelo titular. A exclusão retira os dados do banco ativo; cópias de recuperação seguem o prazo operacional de até 30 dias, sem uso comum pela aplicação.</p><a href="/contrato/exportar" className="text-brand underline">Baixar meus dados individuais</a><DeleteContractData /></Card></div>;
}
