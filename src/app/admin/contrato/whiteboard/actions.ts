"use server";

import { requireAdmin } from "@/lib/auth/current-user";
import { ContractWhiteboardService } from "@/services/contract-whiteboard.service";
import { revalidatePath } from "next/cache";

const service = new ContractWhiteboardService();

export async function getWhiteboardOverviewAction() {
  await requireAdmin();
  return await service.getOverview();
}

export async function getQuestionGraphAction(questionId: string) {
  await requireAdmin();
  return await service.getQuestionGraph(questionId);
}

export async function updateQuestionAction(
  questionId: string,
  updates: {
    title?: string;
    prompt?: string;
    period?: string;
    options?: { code: "A" | "B" | "C"; text: string; privacy: "COMMON" | "PRIVATE" | "SAFETY_PRIVATE" }[];
  },
) {
  await requireAdmin();
  const res = await service.updateQuestion(questionId, updates);
  revalidatePath("/admin/contrato/whiteboard");
  return res;
}

export async function updatePairRuleAction(
  questionId: string,
  pairKey: string,
  updates: {
    action?: string;
    editorialTemplate?: string;
  },
) {
  await requireAdmin();
  const res = await service.updatePairRule(questionId, pairKey, updates);
  revalidatePath("/admin/contrato/whiteboard");
  return res;
}

export async function updateNosDecidimosModuleAction(
  moduleId: string,
  updates: {
    title?: string;
    prompt?: string;
    options?: { code: "A" | "B" | "C"; text: string; template: string }[];
  },
) {
  await requireAdmin();
  const res = await service.updateNosDecidimosModule(moduleId, updates);
  revalidatePath("/admin/contrato/whiteboard");
  return res;
}

export async function publishDraftAction() {
  await requireAdmin();
  const res = await service.publishDraft();
  revalidatePath("/admin/contrato");
  revalidatePath("/admin/contrato/whiteboard");
  return res;
}

export async function resetDraftAction() {
  await requireAdmin();
  const res = await service.resetDraft();
  revalidatePath("/admin/contrato/whiteboard");
  return res;
}
