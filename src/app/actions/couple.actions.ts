"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { COUPLE_ERROR_MESSAGES, CoupleDomainError } from "@/services/couple.errors";
import { CoupleInviteService } from "@/services/couple-invite.service";
import { CoupleService } from "@/services/couple.service";
import { coupleInviteTokenSchema, createCoupleInviteSchema } from "@/validations/couple";

const coupleService = new CoupleService(db);
const inviteService = new CoupleInviteService(db);
const genericError = "Não foi possível concluir a operação. Tente novamente.";

export interface CoupleActionState {
  message?: string;
  fieldErrors?: { email?: string[] };
  invite?: { inviteUrl: string; expiresAt: string };
}

function actionError(error: unknown) {
  return error instanceof CoupleDomainError ? COUPLE_ERROR_MESSAGES[error.code] : genericError;
}

export async function createCoupleInviteAction(
  _state: CoupleActionState,
  formData: FormData,
): Promise<CoupleActionState> {
  const user = await requireUser("/casal");
  if (!user.email) return { message: genericError };
  const parsed = createCoupleInviteSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  try {
    const invite = await inviteService.createInvite({ id: user.id, email: user.email }, parsed.data.email);
    revalidatePath("/casal");
    return { invite };
  } catch (error) {
    return { message: actionError(error) };
  }
}

export async function cancelCoupleInviteAction() {
  const user = await requireUser("/casal");
  let errorMessage: string | undefined;
  try {
    await inviteService.cancelInvite(user.id);
    revalidatePath("/casal");
  } catch (error) {
    errorMessage = actionError(error);
  }
  if (errorMessage) redirect(`/casal?error=${encodeURIComponent(errorMessage)}`);
  redirect("/casal");
}

export async function cancelPendingCoupleAction() {
  const user = await requireUser("/casal");
  let errorMessage: string | undefined;
  try {
    await coupleService.cancelPendingCouple(user.id);
    revalidatePath("/casal");
  } catch (error) {
    errorMessage = actionError(error);
  }
  if (errorMessage) redirect(`/casal?error=${encodeURIComponent(errorMessage)}`);
  redirect("/casal");
}

export async function acceptCoupleInviteAction(
  _state: CoupleActionState,
  formData: FormData,
): Promise<CoupleActionState> {
  const rawToken = String(formData.get("token") ?? "");
  const callbackUrl = `/convite/${rawToken}`;
  const user = await requireUser(callbackUrl);
  if (!user.email) return { message: genericError };
  const parsed = coupleInviteTokenSchema.safeParse({ token: rawToken });
  if (!parsed.success) return { message: "Este convite não está disponível." };
  try {
    await inviteService.acceptInvite({ id: user.id, email: user.email }, parsed.data.token);
  } catch (error) {
    return { message: actionError(error) };
  }
  revalidatePath("/casal");
  revalidatePath(callbackUrl);
  redirect("/casal");
}
