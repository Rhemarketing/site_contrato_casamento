import { Alert } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService } from "@/services/contract.service";
import { ContractError } from "@/features/contract/domain/engine";
import { ContractFund } from "@/features/contract/components/fund";
export default async function FundPage() {
  const user = await requireUser("/contrato/cofrinho");
  let fund: Awaited<ReturnType<ContractService["getFund"]>>;
  try { fund = await new ContractService(db).getFund(user.id); }
  catch (error) { if (!(error instanceof ContractError)) throw error; return <Alert>Esta etapa ainda não está disponível.</Alert>; }
  return <ContractFund fund={fund} />;
}
