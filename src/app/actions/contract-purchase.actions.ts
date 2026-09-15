"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractPurchaseService } from "@/services/contract-purchase.service";

export async function acquireFreeContractAction() {
  const user = await requireUser("/contrato/comprar");
  try {
    await new ContractPurchaseService(db).acquireFree(user.id);
    revalidatePath("/contrato", "layout");
    return { ok: true, message: "Aquisição confirmada por R$ 0,00. Seu acesso e o do parceiro conectado estão liberados." };
  } catch { return { ok: false, message: "Não foi possível confirmar a aquisição. Tente novamente." }; }
}
