import { Alert } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService } from "@/services/contract.service";
import { ContractError } from "@/features/contract/domain/engine";
import { ContractQuestionnaire } from "@/features/contract/components/questionnaire";
import { ContractActionButton } from "@/features/contract/components/action-button";
import { startContractAction } from "@/app/actions/contract.actions";

export default async function ContractQuestionnairePage() {
  const user = await requireUser("/contrato/questionario");
  let session;
  let unavailable = false;
  try {
    session = await new ContractService(db).getOwn(user.id);
  } catch (error) {
    if (!(error instanceof ContractError)) throw error;
    unavailable = true;
  }
  if (unavailable) return <Alert>O questionário principal ainda não está disponível para esta conta. Sua prova de admissão continua disponível na área pessoal.</Alert>;
  if (!session) return <ContractActionButton action={startContractAction}>Iniciar minhas respostas</ContractActionButton>;
  return <ContractQuestionnaire session={session} />;
}
