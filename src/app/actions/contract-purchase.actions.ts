"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractPurchaseService } from "@/services/contract-purchase.service";
import { ContractService } from "@/services/contract.service";

export async function acquireFreeContractAction(): Promise<void> {
  const user = await requireUser("/contrato/comprar");
  try {
    await new ContractPurchaseService(db).acquireFree(user.id);
    await new ContractService(db).start(user.id);
  } catch {
    redirect("/contrato/comprar?error=purchase_failed");
  }
  revalidatePath("/contrato", "layout");
  revalidatePath("/contrato/questionario");
  redirect("/contrato/questionario");
}
