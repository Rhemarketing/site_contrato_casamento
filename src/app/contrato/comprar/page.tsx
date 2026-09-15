import Link from "next/link";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { CONTRACT_PRODUCT, ContractPurchaseService } from "@/services/contract-purchase.service";
import { acquireFreeContractAction } from "@/app/actions/contract-purchase.actions";
import { ContractActionButton } from "@/features/contract/components/action-button";

export default async function BuyContractPage() {
  const user = await requireUser("/contrato/comprar");
  const purchase = await new ContractPurchaseService(db).get(user.id);
  return <Card className="space-y-5"><h2 className="text-2xl font-semibold">{CONTRACT_PRODUCT.name}</h2>
    <p className="text-4xl font-semibold text-brand">{CONTRACT_PRODUCT.displayPrice}</p>
    <p>Questionário individual de 200 perguntas, decisões do casal, contrato e acompanhamento dos acordos. Cada pessoa usa sua própria conta; suas respostas privadas não ficam visíveis ao cônjuge.</p>
    <p>Uma única compra libera as 200 perguntas para os dois. Basta conectar as contas pelo convite do casal para o parceiro receber acesso automaticamente.</p>
    {purchase?.status === "PAID" ? <><p role="status">{purchase.shared ? "Seu acesso está liberado pela compra do seu parceiro. Você não precisa comprar novamente." : "Produto adquirido. Seu acesso e o do parceiro conectado estão liberados."}</p><Link href="/contrato" className="inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white">Acessar meu produto</Link></> : <>
      <p>Ao clicar em Comprar, sua aquisição gratuita será confirmada imediatamente. Não solicitamos cartão e não haverá cobrança ou renovação automática.</p>
      <ContractActionButton action={acquireFreeContractAction}>Comprar — R$ 0,00</ContractActionButton>
    </>}
  </Card>;
}
