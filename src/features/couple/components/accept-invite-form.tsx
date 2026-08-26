"use client";

import { useActionState } from "react";
import { acceptCoupleInviteAction, type CoupleActionState } from "@/app/actions/couple.actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";

const initialState: CoupleActionState = {};

export function AcceptInviteForm({ token }: { token: string }) {
  const [state, action] = useActionState(acceptCoupleInviteAction, initialState);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.message ? <Alert variant="error">{state.message}</Alert> : null}
      <SubmitButton idle="Aceitar convite" pending="Aceitando convite…" />
    </form>
  );
}
