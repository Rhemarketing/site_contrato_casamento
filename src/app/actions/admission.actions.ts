"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { AdmissionAttemptError, ADMISSION_ERROR_MESSAGES } from "@/services/admission-attempt.errors";
import { AdmissionAttemptService } from "@/services/admission-attempt.service";
import { completeAdmissionAttemptSchema, saveAdmissionAnswerSchema } from "@/validations/admission";

const service = new AdmissionAttemptService(db);
const genericError = "Não foi possível concluir a operação. Tente novamente.";

function actionError(error: unknown) {
  if (error instanceof AdmissionAttemptError) return ADMISSION_ERROR_MESSAGES[error.code];
  return genericError;
}

export async function startAdmissionAttemptAction() {
  const user = await requireUser("/admissao/questionario");
  try {
    const attempt = await service.startOrResume(user.id);
    if (attempt.status === "COMPLETED") redirect("/admissao/resultado");
  } catch (error) {
    if (error instanceof AdmissionAttemptError) {
      redirect(`/admissao/questionario?error=${encodeURIComponent(ADMISSION_ERROR_MESSAGES[error.code])}`);
    }
    throw error;
  }
  revalidatePath("/admissao/questionario");
  revalidatePath("/dashboard");
  redirect("/admissao/questionario");
}

export async function saveAdmissionAnswerAction(input: unknown) {
  const user = await requireUser("/admissao/questionario");
  const parsed = saveAdmissionAnswerSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: genericError };
  try {
    await service.saveAnswer(user.id, parsed.data.attemptId, parsed.data.questionId, parsed.data.optionId);
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, message: actionError(error) };
  }
}

export async function completeAdmissionAttemptAction(input: unknown) {
  const user = await requireUser("/admissao/questionario");
  const parsed = completeAdmissionAttemptSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: genericError };
  try {
    await service.complete(user.id, parsed.data.attemptId);
  } catch (error) {
    return { ok: false as const, message: actionError(error) };
  }
  revalidatePath("/admissao/questionario");
  revalidatePath("/admissao/resultado");
  revalidatePath("/dashboard");
  redirect("/admissao/resultado");
}
