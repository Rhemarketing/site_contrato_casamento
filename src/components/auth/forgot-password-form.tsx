"use client";

import { useActionState } from "react";
import {
  requestPasswordResetAction,
  type PasswordResetActionState,
} from "@/app/actions/password-reset.actions";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "./submit-button";

const initialState: PasswordResetActionState = {};

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordResetAction, initialState);
  if (state.message) return <Alert variant="success">{state.message}</Alert>;
  return (
    <form action={action} className="space-y-5" noValidate>
      <Input
        id="forgot-password-email"
        name="email"
        type="email"
        label="E-mail"
        placeholder="voce@exemplo.com"
        autoComplete="email"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email?.[0]}
        required
      />
      <SubmitButton idle="Enviar instruções" pending="Enviando…" />
    </form>
  );
}
