"use client";

import { useActionState } from "react";
import { resetPasswordAction, type PasswordResetActionState } from "@/app/actions/password-reset.actions";
import { Input } from "@/components/ui/input";
import { FormError } from "./form-error";
import { SubmitButton } from "./submit-button";

const initialState: PasswordResetActionState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initialState);
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormError message={state.formError} />
      <Input
        id="new-password"
        name="password"
        type="password"
        label="Nova senha"
        hint="Use ao menos 12 caracteres."
        autoComplete="new-password"
        error={state.fieldErrors?.password?.[0]}
        required
      />
      <Input
        id="new-password-confirmation"
        name="passwordConfirmation"
        type="password"
        label="Confirme a nova senha"
        autoComplete="new-password"
        error={state.fieldErrors?.passwordConfirmation?.[0]}
        required
      />
      <SubmitButton idle="Redefinir senha" pending="Redefinindo…" />
    </form>
  );
}
