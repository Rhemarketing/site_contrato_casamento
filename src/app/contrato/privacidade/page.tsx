import Link from "next/link";
import { Alert, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService } from "@/services/contract.service";
import { ContractError } from "@/features/contract/domain/engine";
import { ContractActionButton } from "@/features/contract/components/action-button";
import { revokeContractReviewAction } from "@/app/actions/contract.actions";
import { DeleteContractData } from "@/features/contract/components/document-controls";

export default async function PrivacyPage() {
  const user = await requireUser("/contrato/privacidade");
  let area;
  try { area = await new ContractService(db).privateArea(user.id); }
  catch (e) { if (!(e instanceof ContractError)) throw e; }
  const status: Record<string, string> = { REQUESTED: "Solicitada anteriormente", CONTINUE: "Revisão anterior concluída", PAUSE: "Pausa registrada anteriormente", CLOSE: "Revisão encerrada", REVOKED: "Autorização revogada", OUTDATED: "Revisão de respostas anteriores" };
  return <div className="space-y-6"><h2 className="text-2xl font-semibold">Minha privacidade e cuidado individual</h2><Card className="space-y-4"><p>Esta página é individual. Os alertas são informativos e não exigem revisão nem impedem a criação do contrato. O outro cônjuge não recebe suas respostas ou alertas privados.</p>
    {!area ? <Link href="/contrato" className="text-brand underline">Iniciar minha sessão</Link> : <>
      {area.safety.critical ? <Alert variant="warning">Suas respostas acionaram um alerta crítico. Considere buscar apoio individual adequado à sua situação. Este aviso é privado e não bloqueia sua continuação ou a criação do contrato.</Alert> : <p>Leia abaixo suas orientações individuais. A ausência de alerta registrado não certifica a segurança de uma relação.</p>}
      <section className="space-y-4" aria-labelledby="private-blockers"><h3 id="private-blockers" className="text-xl font-semibold">Meus alertas e pendências de preenchimento</h3>
        <p>Os detalhes abaixo usam somente suas próprias respostas. Não mostram respostas ou pendências privadas do seu parceiro.</p>
        {area.blockers.map(item => <div key={item.id} className="space-y-2 rounded-xl border border-line p-4"><h4 className="font-semibold">{item.questionId} — {item.title}</h4><p>{item.blocking ? "Preenchimento pendente" : "Aviso privado — não bloqueia o contrato"}</p><p className="whitespace-pre-wrap"><strong>Você registrou: </strong>{item.selected}</p><p><strong>Motivo: </strong>{item.reason}</p><p><strong>Próximo passo: </strong>{item.nextStep}</p></div>)}
        {!area.submitted ? <p>Falta concluir suas respostas após resolver as pendências acima.</p> : !area.consented ? <p>Suas respostas estão concluídas. Falta autorizar a avaliação do casal após conectar as contas.</p> : null}
        {!area.blockers.some(item => item.blocking) && area.submitted && area.consented ? <p>Não há pendências nas suas respostas ou na sua autorização. <Link href="/contrato/decisoes" className="text-brand underline">Continuar para NÓS DECIDIMOS</Link>.</p> : null}
        <Link href="/contrato/questionario" className="inline-block text-brand underline">Abrir Minhas respostas</Link>
        <p className="text-sm text-muted">Para editar uma sessão concluída, clique em Corrigir minhas respostas. Depois, conclua novamente e autorize a avaliação. A correção invalida propostas e documentos derivados.</p>
      </section>
      {area.guidance.length ? <details><summary className="cursor-pointer font-semibold">Minhas orientações individuais do Método</summary><p className="mt-3">Textos privados para sua reflexão. Não representam acordo ou aceite do cônjuge. Nenhuma orientação exige exposição ou conversa quando houver risco.</p>{area.guidance.map(item => <section key={item.id} className="mt-4"><h3 className="font-semibold">{item.title}</h3><p>{item.text}</p></section>)}</details> : null}
      {area.reviews.length ? <p>Histórico de revisões anteriores. Esses registros não condicionam seu acesso ao contrato.</p> : null}
      {area.reviews.map(r => <div key={r.id} className="space-y-2 border-t border-line pt-3"><p>{status[r.status] ?? "Revisão registrada"} — {new Date(r.date).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>{r.status !== "REVOKED" ? <ContractActionButton action={revokeContractReviewAction.bind(null, r.id)}>Revogar acesso desta revisão</ContractActionButton> : null}</div>)}
    </>}
  </Card><Card className="space-y-5"><p>Espaços sem documento aceito pelos dois são removidos após 180 dias sem alterações. Documentos aceitos e seu histórico permanecem até a exclusão solicitada pelo titular. A exclusão retira os dados do banco ativo; cópias de recuperação seguem o prazo operacional de até 30 dias, sem uso comum pela aplicação.</p><a href="/contrato/exportar" className="text-brand underline">Baixar meus dados individuais</a><DeleteContractData /></Card></div>;
}
