"use server";

import { redirect } from "next/navigation";
import { createPasswordResetService } from "@/services/password-reset.factory";
import { PASSWORD_RESET_PUBLIC_MESSAGE } from "@/services/password-reset.service";
import { passwordResetRequestSchema, passwordResetSubmissionSchema } from "@/validations/auth";

export interface PasswordResetActionState {
  message?: string;
  formError?: string;
  fieldErrors?: { email?: string[]; password?: string[]; passwordConfirmation?: string[] };
  values?: { email?: string };
}

const service = createPasswordResetService();

export async function requestPasswordResetAction(
  _state: PasswordResetActionState,
  formData: FormData,
): Promise<PasswordResetActionState> {
  const email = String(formData.get("email") ?? "");
  const parsed = passwordResetRequestSchema.safeParse({ email });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values: { email } };
  }
  try {
    await service.request(parsed.data);
  } catch {
    // Do not reveal account, database, or SMTP state through this public action.
  }
  return { message: PASSWORD_RESET_PUBLIC_MESSAGE };
}

export async function resetPasswordAction(
  _state: PasswordResetActionState,
  formData: FormData,
): Promise<PasswordResetActionState> {
  const input = {
    token: String(formData.get("token") ?? ""),
    password: String(formData.get("password") ?? ""),
    passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
  };
  const parsed = passwordResetSubmissionSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  let result: Awaited<ReturnType<typeof service.reset>>;
  try {
    result = await service.reset(parsed.data);
  } catch {
    return { formError: "Não foi possível redefinir a senha. Solicite um novo link e tente novamente." };
  }
  if (result === "SUCCESS") redirect("/redefinir-senha/sucesso");
  if (result === "EXPIRED") return { formError: "Este link expirou. Solicite uma nova redefinição de senha." };
  if (result === "USED") return { formError: "Este link já foi utilizado ou substituído. Solicite um novo link." };
  return { formError: "Este link de redefinição não é válido." };
}
