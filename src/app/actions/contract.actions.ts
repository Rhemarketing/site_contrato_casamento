"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService } from "@/services/contract.service";
import { ContractError } from "@/features/contract/domain/engine";

const service = new ContractService(db);
export type ContractActionResult = { ok: boolean; message: string };
async function run(operation: (userId: string) => Promise<unknown>): Promise<ContractActionResult> {
  const user = await requireUser("/contrato");
  try {
    await operation(user.id);
    revalidatePath("/contrato", "layout");
    return { ok: true, message: "Alteração registrada." };
  } catch (error) {
    const code = error instanceof ContractError ? error.code : "";
    const messages: Record<string, string> = {
      CONFLICT: "Esta sessão mudou em outra aba. Recarregue a página antes de continuar.",
      SUBMISSION_INCOMPLETE: "Ainda há perguntas ou condições individuais pendentes.",
      SESSION_CLOSED: "Esta sessão já foi concluída.",
      QUESTION_UNAVAILABLE: "Esta pergunta ainda não está disponível para resposta.",
      PREVIEW_UNAVAILABLE: "A prévia está disponível somente para as contas de teste configuradas.",
      COUPLE_UNAVAILABLE: "Conecte as duas contas do casal para iniciar.",
    };
    return { ok: false, message: messages[code] ?? "Não foi possível realizar esta operação. Tente novamente pela sua área individual." };
  }
}
export async function startContractAction() { return run(id => service.start(id)); }
export async function saveContractAnswerAction(input: unknown) { return run(id => service.saveAnswer(id, input)); }
export async function saveContractContextAction(input: unknown) { return run(id => service.saveContext(id, input)); }
export async function submitContractAction(sessionId: string, revision: number) { return run(id => service.submit(id, sessionId, revision)); }
export async function consentContractAction(sessionId: string, revision: number, enabled: boolean) { return run(id => service.consent(id, sessionId, revision, enabled)); }
export async function proposeContractDecisionAction(input: unknown) { return run(id => service.propose(id, input)); }
export async function confirmContractDecisionAction(moduleId: string, hash: string, consensus: boolean) { return run(id => service.confirm(id, moduleId, hash, consensus)); }
export async function generateContractAction() {
  const user = await requireUser("/contrato/documento");
  try {
    const result = await service.generate(user.id);
    revalidatePath("/contrato/documento");
    return { ok: result.state === "DRAFT", message: result.message };
  } catch { return { ok: false, message: "Esta etapa ainda não está disponível. Você pode continuar usando sua área individual." }; }
}
