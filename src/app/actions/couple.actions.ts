"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { COUPLE_ERROR_MESSAGES, CoupleDomainError } from "@/services/couple.errors";
import { CoupleInviteService } from "@/services/couple-invite.service";
import { normalizeWhatsAppPhone, whatsAppInviteUrl } from "@/lib/whatsapp";
import { COUPLE_COMPARISON_ERROR_MESSAGES, CoupleComparisonDomainError } from "@/services/couple-comparison.errors";
import { CoupleComparisonService } from "@/services/couple-comparison.service";
import { CoupleService } from "@/services/couple.service";
import { PrismaCoupleComparisonRepository } from "@/repositories/prisma/prisma-couple-comparison.repository";
import { coupleInviteTokenSchema } from "@/validations/couple";

const coupleService = new CoupleService(db);
const inviteService = new CoupleInviteService(db);
const comparisonService = new CoupleComparisonService(new PrismaCoupleComparisonRepository(db));
const genericError = "Não foi possível concluir a operação. Tente novamente.";

export interface CoupleActionState {
  message?: string;
  fieldErrors?: { phone?: string[] };
  invite?: { inviteUrl: string; expiresAt: string; whatsappUrl: string };
}

function actionError(error: unknown) {
  return error instanceof CoupleDomainError ? COUPLE_ERROR_MESSAGES[error.code] : genericError;
}

function comparisonActionError(error: unknown) {
  return error instanceof CoupleComparisonDomainError
    ? COUPLE_COMPARISON_ERROR_MESSAGES[error.code]
    : genericError;
}

export async function consentToCoupleComparison() {
  const user = await requireUser("/casal/comparacao");
  let errorMessage: string | undefined;
  try {
    await comparisonService.consent(user.id);
    revalidatePath("/casal/comparacao");
  } catch (error) {
    errorMessage = comparisonActionError(error);
  }
  if (errorMessage) redirect(`/casal/comparacao?error=${encodeURIComponent(errorMessage)}`);
  redirect("/casal/comparacao");
}

export async function revokeCoupleComparisonConsent() {
  const user = await requireUser("/casal/comparacao");
  let errorMessage: string | undefined;
  try {
    await comparisonService.revoke(user.id);
    revalidatePath("/casal/comparacao");
  } catch (error) {
    errorMessage = comparisonActionError(error);
  }
  if (errorMessage) redirect(`/casal/comparacao?error=${encodeURIComponent(errorMessage)}`);
  redirect("/casal/comparacao");
}

export async function createCoupleInviteAction(
  _state: CoupleActionState,
  formData: FormData,
): Promise<CoupleActionState> {
  const user = await requireUser("/casal");
  if (!user.email) return { message: genericError };
  const phone = normalizeWhatsAppPhone(String(formData.get("phone") ?? ""));
  if (!phone) return { fieldErrors: { phone: ["Informe o WhatsApp com DDD e nove dígitos."] } };
  try {
    const invite = await inviteService.createWhatsAppInvite(
      { id: user.id, email: user.email },
      phone,
    );
    revalidatePath("/casal");
    return { invite: { ...invite, whatsappUrl: whatsAppInviteUrl(phone, invite.inviteUrl) } };
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
    revalidatePath("/contrato", "layout");
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
  revalidatePath("/contrato", "layout");
  redirect("/casal");
}
