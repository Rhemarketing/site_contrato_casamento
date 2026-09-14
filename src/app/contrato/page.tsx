import Link from "next/link";
import { Card, Alert, Badge } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { contractAvailable, previewAvailable, requireContractPreview } from "@/features/contract/server/access";
import { db } from "@/lib/db";
import { ContractPurchaseService } from "@/services/contract-purchase.service";
import { ContractActionButton } from "@/features/contract/components/action-button";
import { startContractAction } from "@/app/actions/contract.actions";

export default async function ContractPage() {
  const user = await requireUser("/contrato");
  let allowed = false;
  const purchase = await new ContractPurchaseService(db).get(user.id);
  const acquired = purchase?.status === "PAID";
  if (previewAvailable()) { try { requireContractPreview(user.id); allowed = true; } catch {} }
  return <div className="space-y-6"><Card><Badge>Arquivo-mestre 1.4.0</Badge><h2 className="mt-4 text-2xl font-semibold text-brand-strong">Do diálogo aos compromissos</h2>
    <ol className="mt-5 space-y-3"><li>1. Cada pessoa responde individualmente às perguntas aplicáveis.</li><li>2. Os dois autorizam a avaliação para preparar os acordos.</li><li>3. As decisões conjuntas exigem confirmação da mesma proposta.</li><li>4. O contrato utiliza os textos cadastrados e as decisões confirmadas.</li></ol></Card>
    <Card className="space-y-4"><h2 className="text-xl font-semibold">Contrato de Casamento — R$ 0,00</h2><p>{acquired ? "Sua aquisição gratuita está confirmada." : "Confirme sua aquisição gratuita para vincular o produto à sua conta."}</p><Link className="inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white" href="/contrato/comprar">{acquired ? "Consultar aquisição" : "Comprar — R$ 0,00"}</Link></Card>
    {contractAvailable() && acquired ? <Card className="space-y-4"><h2 className="text-xl font-semibold">Seu espaço individual</h2><p>Conecte as duas contas do casal. Ao iniciar, suas respostas serão armazenadas de forma criptografada para preparar seus acordos. O compartilhamento exige autorização separada e pode ser revogado.</p><ContractActionButton action={startContractAction}>Iniciar ou continuar minhas respostas</ContractActionButton><Link className="block text-brand underline" href="/contrato/questionario">Abrir questionário</Link></Card> : <Alert>Adquira seu acesso gratuito para responder ao questionário. Se a aquisição já está confirmada, a ativação do servidor ainda está em andamento.</Alert>}
    {allowed ? <Card className="space-y-4"><h2 className="text-xl font-semibold">Prévia com dados fictícios</h2><p>Use as contas de teste conectadas. As 200 regras de aplicabilidade estão cadastradas. Contextos não informados e exigências de revisão privada impedem a conclusão; a avaliação conjunta exige as duas autorizações e os controles de segurança.</p><ContractActionButton action={startContractAction}>Iniciar ou continuar a prévia</ContractActionButton><Link className="inline-block text-brand underline" href="/contrato/questionario">Abrir minhas respostas</Link></Card> : null}
    <Link href="/admissao/resultado" className="inline-block text-brand underline">Consultar meu resultado de admissão</Link>
    {user.role === "ADMIN" ? <p><Link className="text-brand underline" href="/admin/contrato">Revisar catálogo e pendências de integração</Link></p> : null}
  </div>;
}
