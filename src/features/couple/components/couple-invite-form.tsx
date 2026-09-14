"use client";

import { useActionState, useEffect, useState } from "react";
import { createCoupleInviteAction, type CoupleActionState } from "@/app/actions/couple.actions";
import { Button } from "@/components/ui/button";
import { formatWhatsAppPhone } from "@/lib/whatsapp";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { CopyInviteLink } from "./copy-invite-link";

const initialState: CoupleActionState = {};

export function CoupleInviteForm({ defaultPhone, regenerate = false }: { defaultPhone?: string | null; regenerate?: boolean }) {
  const [state, action, pending] = useActionState(createCoupleInviteAction, initialState);
  const [phone, setPhone] = useState(formatWhatsAppPhone(defaultPhone ?? ""));
  useEffect(() => {
    if (state.invite) window.location.assign(state.invite.whatsappUrl);
  }, [state.invite]);
  return (
    <div className="space-y-5">
      {regenerate ? <p className="text-sm text-muted">Ao gerar um novo link, o link anterior deixará de funcionar.</p> : null}
      <form action={action} className="space-y-4" noValidate>
        {state.message ? <Alert variant="error">{state.message}</Alert> : null}
        <Input
          id={regenerate ? "regenerate-couple-phone" : "couple-phone"}
          name="phone"
          type="tel"
          inputMode="tel"
          label="WhatsApp do parceiro"
          placeholder="(xx) xxxxx-xxxx"
          autoComplete="tel-national"
          value={phone}
          onChange={event => setPhone(formatWhatsAppPhone(event.target.value))}
          disabled={pending}
          error={state.fieldErrors?.phone?.[0]}
          required
        />
        <p className="text-sm text-muted">O WhatsApp abrirá com o convite pronto. Confirme o envio da mensagem para seu parceiro.</p>
        <Button type="submit" disabled={pending} className="gap-2">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20.52 3.48A11.9 11.9 0 0 0 12.04 0C5.43 0 .05 5.38.05 12c0 2.12.55 4.19 1.6 6.01L0 24l6.14-1.61A11.98 11.98 0 0 0 12.04 24C18.65 24 24 18.62 24 12c0-3.2-1.24-6.21-3.48-8.52ZM12.04 22a9.94 9.94 0 0 1-5.07-1.39l-.36-.21-3.65.96.97-3.56-.23-.37A9.98 9.98 0 0 1 2.05 12C2.05 6.48 6.53 2 12.04 2 17.55 2 22 6.48 22 12s-4.45 10-9.96 10Zm5.48-7.48c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.94 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.53.07-.8.37-.28.3-1.05 1.03-1.05 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.77-.73 2.02-1.43.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35Z" /></svg>
          {pending ? "Preparando convite…" : "Convidar parceiro"}
        </Button>
      </form>
      {state.invite ? (
        <Alert
          title="Convite preparado"
          variant="success"
        >
          <div className="space-y-3">
            <p>
              O convite expira em 7 dias. Se o WhatsApp não abriu, use o botão abaixo.
            </p>
            <p className="break-all rounded-lg bg-white/70 p-3 font-mono text-xs">{state.invite.inviteUrl}</p>
            <CopyInviteLink inviteUrl={state.invite.inviteUrl} />
            <a className="block font-semibold underline" href={state.invite.whatsappUrl} rel="noreferrer">Abrir WhatsApp</a>
          </div>
        </Alert>
      ) : null}
    </div>
  );
}
