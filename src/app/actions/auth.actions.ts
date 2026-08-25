"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { getSafeCallbackUrl } from "@/lib/auth/callback-url";
import { PrismaUserRepository } from "@/repositories/prisma/prisma-user.repository";
import { EmailAlreadyRegisteredError, registerUser } from "@/services/auth.service";
import { loginSchema, registrationSchema } from "@/validations/auth";

const userRepository = new PrismaUserRepository();

export interface AuthActionState {
  formError?: string;
  fieldErrors?: Record<string, string[]>;
  values?: { name?: string; email?: string };
}

function fields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
  };
}

export async function loginAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const input = fields(formData);
  const parsed = loginSchema.safeParse({ email: input.email, password: input.password });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values: { email: input.email } };
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: getSafeCallbackUrl(String(formData.get("callbackUrl") ?? "")),
    });
  } catch (error) {
    if (error instanceof AuthError) return { formError: "E-mail ou senha inválidos.", values: { email: input.email } };
    throw error;
  }
  return {};
}

export async function registerAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const input = fields(formData);
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values: { name: input.name, email: input.email } };
  try {
    await registerUser(parsed.data, userRepository);
  } catch (error) {
    if (error instanceof EmailAlreadyRegisteredError) return { fieldErrors: { email: [error.message] }, values: { name: input.name, email: input.email } };
    throw error;
  }
  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: getSafeCallbackUrl(String(formData.get("callbackUrl") ?? "")),
  });
  return {};
}
