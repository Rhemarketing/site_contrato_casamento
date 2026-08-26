"use client";

import { useActionState } from "react";
import { createCoupleInviteAction, type CoupleActionState } from "@/app/actions/couple.actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { CopyInviteLink } from "./copy-invite-link";

const initialState: CoupleActionState = {};

export function CoupleInviteForm({ defaultEmail, regenerate = false }: { defaultEmail?: string; regenerate?: boolean }) {
  const [state, action] = useActionState(createCoupleInviteAction, initialState);
  return (
    <div className="space-y-5">
      {regenerate ? <p className="text-sm text-muted">Ao gerar um novo link, o link anterior deixará de funcionar.</p> : null}
      <form action={action} className="space-y-4" noValidate>
        {state.message ? <Alert variant="error">{state.message}</Alert> : null}
        <Input
          id={regenerate ? "regenerate-couple-email" : "couple-email"}
          name="email"
          type="email"
          label="E-mail do cônjuge"
          autoComplete="email"
          defaultValue={defaultEmail}
          error={state.fieldErrors?.email?.[0]}
          required
        />
        <SubmitButton idle={regenerate ? "Gerar novo link" : "Criar convite"} pending={regenerate ? "Gerando novo link…" : "Criando convite…"} />
      </form>
      {state.invite ? (
        <Alert title="Convite criado" variant="success">
          <div className="space-y-3">
            <p>Este link é individual e expira em 7 dias.</p>
            <p className="break-all rounded-lg bg-white/70 p-3 font-mono text-xs">{state.invite.inviteUrl}</p>
            <CopyInviteLink inviteUrl={state.invite.inviteUrl} />
          </div>
        </Alert>
      ) : null}
    </div>
  );
}
