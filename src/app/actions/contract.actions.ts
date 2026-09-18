"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { ContractService } from "@/services/contract.service";
import { ContractError } from "@/features/contract/domain/engine";

const service = new ContractService(db);
export type ContractActionResult<T = unknown> = { ok: boolean; message: string; data?: T };
async function run<T>(operation: (userId: string) => Promise<T>): Promise<ContractActionResult<T>> {
  const user = await requireUser("/contrato");
  try {
    const data = await operation(user.id);
    revalidatePath("/contrato", "layout");
    return { ok: true, message: "Alteração registrada.", data };
  } catch (error) {
    const code = error instanceof ContractError ? error.code : "";
    const messages: Record<string, string> = {
      CONFLICT: "Esta sessão mudou em outra aba. Recarregue a página antes de continuar.",
      SUBMISSION_INCOMPLETE: "Ainda há perguntas ou condições individuais pendentes.",
      SESSION_CLOSED: "Esta sessão já foi concluída.",
      QUESTION_UNAVAILABLE: "Esta pergunta ainda não está disponível para resposta.",
      PREVIEW_UNAVAILABLE: "A prévia está disponível somente para as contas de teste configuradas.",
      COUPLE_UNAVAILABLE: "Conecte as duas contas do casal para acessar esta etapa conjunta.",
      PRODUCT_NOT_ACQUIRED: "Adquira seu acesso gratuito na página Comprar para continuar.",
      INVALID_DECISION: "Preencha os campos do acordo. Confira datas, valores e responsáveis antes de registrar.",
    };
    return { ok: false, message: messages[code] ?? "Não foi possível realizar esta operação. Tente novamente pela sua área individual." };
  }
}
export async function startContractAction() { return run(id => service.start(id)); }
export async function reopenContractAction(sessionId: string, revision: number) { return run(id => service.reopen(id, sessionId, revision)); }
export async function requestContractReviewAction(reviewerId: string, consent: boolean, q151Requested = false) { return run(id => service.requestPrivateReview(id, reviewerId, consent, q151Requested)); }
export async function revokeContractReviewAction(reviewId: string) { return run(id => service.revokePrivateReview(id, reviewId)); }
export async function decideContractReviewAction(reviewId: string, outcome: "CONTINUE" | "PAUSE" | "CLOSE") { return run(id => service.decidePrivateReview(id, reviewId, outcome)); }
export async function saveContractAnswerAction(input: unknown) { return run(id => service.saveAnswer(id, input)); }
export async function saveContractContextAction(input: unknown) { return run(id => service.saveContext(id, input)); }
export async function submitContractAction(sessionId: string, revision: number) { return run(id => service.submit(id, sessionId, revision)); }
export async function consentContractAction(sessionId: string, revision: number, enabled: boolean) { return run(id => service.consent(id, sessionId, revision, enabled)); }
export async function proposeContractDecisionAction(input: unknown) { return run(id => service.propose(id, input)); }
export async function withdrawExtraContractDecisionAction(moduleId: string, hash: string) { return run(id => service.withdrawExtraDecision(id, moduleId, hash)); }
export async function saveContractJointFactsAction(revision: number, input: unknown) { return run(id => service.saveJointFacts(id, revision, input)); }
export async function saveContractRecordAction(revision: number, input: unknown) { return run(id => service.saveOwnRecord(id, revision, input)); }
export async function deleteContractRecordAction(recordId: string, revision: number) { return run(id => service.deleteOwnRecord(id, recordId, revision)); }
export async function acceptContractDocumentAction(hash: string) { return run(id => service.acceptDocument(id, hash)); }
export async function proposeContractFundAction(value: unknown) { return run(id => service.proposeFund(id, value)); }
export async function confirmContractFundAction(recordId: string, hash: string, accept: boolean) { return run(id => service.confirmFund(id, recordId, hash, accept)); }
export async function deleteContractDataAction(confirmation: string) { return run(id => service.deleteOwnData(id, confirmation)); }
export async function confirmContractDecisionAction(moduleId: string, hash: string, consensus: boolean) { return run(id => service.confirm(id, moduleId, hash, consensus)); }
export async function generateContractAction(reason = "") {
  const user = await requireUser("/contrato/documento");
  try {
    const result = await service.generate(user.id, reason);
    revalidatePath("/contrato/documento");
    return { ok: result.state === "DRAFT", message: result.message };
  } catch (error) { if (error instanceof ContractError && error.code === "REVISION_REASON_REQUIRED") return { ok: false, message: "Informe o motivo da alteração para preservar o histórico do contrato." }; return { ok: false, message: "Esta etapa ainda não está disponível. Você pode continuar usando sua área individual." }; }
}
