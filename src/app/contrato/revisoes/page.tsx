import { Alert, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService } from "@/services/contract.service";
import { ContractError } from "@/features/contract/domain/engine";
import { ContractActionButton } from "@/features/contract/components/action-button";
import { decideContractReviewAction } from "@/app/actions/contract.actions";

export default async function ReviewsPage() {
  const user = await requireUser("/contrato/revisoes");
  let reviews;
  try { reviews = await new ContractService(db).assignedReviews(user.id); }
  catch (error) { if (!(error instanceof ContractError)) throw error; }
  if (!reviews) return <Alert>Área restrita aos revisores habilitados e autorizados pelo titular.</Alert>;
  return <div className="space-y-6"><h2 className="text-2xl font-semibold">Revisões autorizadas</h2><p>Use somente o escopo autorizado. Não copie dados para outros canais, não contate o cônjuge e não registre diagnóstico. Continuar permite o fluxo do produto; não declara segurança, impõe reconciliação ou confirma acordos.</p>
    {!reviews.length ? <Alert>Nenhuma revisão pendente com autorização vigente.</Alert> : reviews.map(r => <Card key={r.id} className="space-y-4"><h3 className="text-xl font-semibold">{r.name}</h3>{[...r.questions, ...r.privateQuestions].map(q => <div key={q.id}><p className="font-semibold">{q.prompt}</p><p>{q.answer}</p></div>)}<p>Relato de compressão do pescoço: {r.neckCompressionReport === null ? "Não informado" : r.neckCompressionReport ? "Sim" : "Não"}.</p><p>Revisão específica de bebidas: {r.q151 ? "Solicitada. Não permitir enquanto houver uso problemático ativo relatado na Q151-C." : "Não solicitada"}.</p><p>Solicita abordagem da Q181: {r.q181 ? "Sim" : "Não"}.</p>
      <div className="flex flex-wrap gap-3"><ContractActionButton action={decideContractReviewAction.bind(null, r.id, "CONTINUE")}>Permitir continuação após revisão</ContractActionButton><ContractActionButton action={decideContractReviewAction.bind(null, r.id, "PAUSE")}>Manter pausa individual</ContractActionButton><ContractActionButton action={decideContractReviewAction.bind(null, r.id, "CLOSE")}>Encerrar revisão</ContractActionButton></div>
    </Card>)}
  </div>;
}
