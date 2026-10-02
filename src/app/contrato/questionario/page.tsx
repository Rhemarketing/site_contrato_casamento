import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService } from "@/services/contract.service";
import { ContractError } from "@/features/contract/domain/engine";
import { ContractQuestionnaire } from "@/features/contract/components/questionnaire";

export const metadata: Metadata = { title: "Questionário do contrato" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContractQuestionnairePage() {
  const user = await requireUser("/contrato/questionario");
  const service = new ContractService(db);
  let session = null;
  let unavailable = false;

  try {
    session = await service.getOwn(user.id);
  } catch (error) {
    if (error instanceof ContractError) {
      if (error.code === "PRODUCT_NOT_ACQUIRED") {
        redirect("/contrato/comprar");
      }
      unavailable = true;
    } else {
      throw error;
    }
  }

  // Se o usuário já comprou mas a sessão ainda não foi iniciada, inicia automaticamente
  if (!session && !unavailable) {
    try {
      await service.start(user.id);
      session = await service.getOwn(user.id);
    } catch (error) {
      if (error instanceof ContractError) {
        if (error.code === "PRODUCT_NOT_ACQUIRED") {
          redirect("/contrato/comprar");
        }
        unavailable = true;
      } else {
        throw error;
      }
    }
  }

  if (unavailable || !session) {
    return (
      <Alert>
        O questionário principal ainda não está disponível para esta conta. Seu exame de admissão continua disponível na área pessoal.
      </Alert>
    );
  }

  return <ContractQuestionnaire session={session} />;
}
