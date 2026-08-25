"use client";

import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/app/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { FormError } from "./form-error";
import { SubmitButton } from "./submit-button";

const initialState: AuthActionState = {};

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action] = useActionState(loginAction, initialState);
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <FormError message={state.formError} />
      <Input id="login-email" name="email" type="email" label="E-mail" placeholder="voce@exemplo.com" autoComplete="email" defaultValue={state.values?.email} error={state.fieldErrors?.email?.[0]} required />
      <Input id="login-password" name="password" type="password" label="Senha" autoComplete="current-password" error={state.fieldErrors?.password?.[0]} required />
      <SubmitButton idle="Entrar" pending="Entrando…" />
    </form>
  );
}
