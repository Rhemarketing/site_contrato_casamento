import { Alert } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService, NEUTRAL_SHARED_STATE } from "@/services/contract.service";
import { ContractError } from "@/features/contract/domain/engine";
import { JointDecisions } from "@/features/contract/components/joint-decisions";

export default async function ContractDecisionsPage() {
  const user = await requireUser("/contrato/decisoes");
  let shared;
  try { shared = await new ContractService(db).getShared(user.id); }
  catch (error) { if (!(error instanceof ContractError)) throw error; shared = NEUTRAL_SHARED_STATE; }
  return <div className="space-y-6"><h2 className="font-serif text-3xl text-brand-strong">NÓS DECIDIMOS</h2><Alert>{shared.message}</Alert><JointDecisions modules={shared.modules} /></div>;
}
