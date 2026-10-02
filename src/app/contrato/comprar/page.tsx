import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { CONTRACT_PRODUCT, ContractPurchaseService } from "@/services/contract-purchase.service";
import { acquireFreeContractAction } from "@/app/actions/contract-purchase.actions";

export const metadata: Metadata = { title: "Comprar produto" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BuyContractPage() {
  const user = await requireUser("/contrato/comprar");
  const purchase = await new ContractPurchaseService(db).get(user.id);

  if (purchase?.status === "PAID") {
    redirect("/contrato/questionario");
  }

  return (
    <Card className="space-y-5">
      <h2 className="text-2xl font-semibold">{CONTRACT_PRODUCT.name}</h2>
      <p className="text-4xl font-semibold text-brand">{CONTRACT_PRODUCT.displayPrice}</p>
      <p>
        Questionário individual de 200 perguntas, decisões do casal, contrato e acompanhamento dos acordos. Cada pessoa usa sua própria conta; suas respostas privadas não ficam visíveis ao cônjuge.
      </p>
      <p>
        Você pode responder ao questionário de 200 perguntas individualmente agora, mesmo sem estar vinculado a um parceiro. Caso queira conectar seu parceiro no futuro, esta mesma compra já libera o acesso para os dois automaticamente.
      </p>
      <p className="text-sm text-muted">
        Ao clicar em Comprar, sua aquisição gratuita será confirmada imediatamente e você será direcionado à 1ª pergunta do questionário de 200 questões.
      </p>
      <form action={acquireFreeContractAction}>
        <Button type="submit">Comprar — R$ 0,00</Button>
      </form>
    </Card>
  );
}
