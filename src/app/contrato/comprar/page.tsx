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
    {purchase?.status === "PAID" ? <><p role="status">Produto adquirido. A aquisição de R$ 0,00 está confirmada e seu acesso está ativo.</p><Link href="/contrato" className="inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white">Acessar meu produto</Link></> : <>
      <p>Ao clicar em Comprar, sua aquisição gratuita será confirmada imediatamente. Não solicitamos cartão e não haverá cobrança ou renovação automática.</p>
      <ContractActionButton action={acquireFreeContractAction}>Comprar — R$ 0,00</ContractActionButton>
    </>}
  </Card>;
}
