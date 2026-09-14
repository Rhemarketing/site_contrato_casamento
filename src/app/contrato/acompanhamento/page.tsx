import { Alert } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService } from "@/services/contract.service";
import { ContractError } from "@/features/contract/domain/engine";
import { ContractOperations } from "@/features/contract/components/operations";

export default async function OperationsPage() {
  const user = await requireUser("/contrato/acompanhamento");
  let area;
  try { area = await new ContractService(db).getOperations(user.id); }
  catch (error) { if (!(error instanceof ContractError)) throw error; }
  return <div className="space-y-6"><h2 className="text-2xl font-semibold">Acompanhamento e agenda</h2>{area ? <ContractOperations area={area} /> : <Alert>Inicie sua sessão individual para usar este espaço.</Alert>}</div>;
}
