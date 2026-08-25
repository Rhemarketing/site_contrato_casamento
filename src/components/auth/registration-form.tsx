"use client";

import { useActionState } from "react";
import { registerAction, type AuthActionState } from "@/app/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { FormError } from "./form-error";
import { SubmitButton } from "./submit-button";

const initialState: AuthActionState = {};

export function RegistrationForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action] = useActionState(registerAction, initialState);
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <FormError message={state.formError} />
      <Input id="registration-name" name="name" label="Nome" autoComplete="name" defaultValue={state.values?.name} error={state.fieldErrors?.name?.[0]} required />
      <Input id="registration-email" name="email" type="email" label="E-mail" autoComplete="email" defaultValue={state.values?.email} error={state.fieldErrors?.email?.[0]} required />
      <Input id="registration-password" name="password" type="password" label="Senha" hint="Use ao menos 12 caracteres." autoComplete="new-password" error={state.fieldErrors?.password?.[0]} required />
      <Input id="registration-confirmation" name="passwordConfirmation" type="password" label="Confirmar senha" autoComplete="new-password" error={state.fieldErrors?.passwordConfirmation?.[0]} required />
      <SubmitButton idle="Criar conta" pending="Criando conta…" />
    </form>
  );
}
