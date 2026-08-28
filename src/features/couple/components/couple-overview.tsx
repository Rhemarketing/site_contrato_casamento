import { cancelCoupleInviteAction, cancelPendingCoupleAction } from "@/app/actions/couple.actions";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CoupleOverviewDto } from "@/types/couple";
import { CoupleInviteForm } from "./couple-invite-form";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(value));
}

export function CoupleOverview({ overview, error }: { overview: CoupleOverviewDto; error?: string }) {
  if (overview.state === "NONE") {
    return (
      <Card className="mx-auto max-w-2xl space-y-6">
        {error ? <Alert variant="error">{error}</Alert> : null}
        <div>
          <Badge>Convite individual</Badge>
          <h2 className="mt-4 font-serif text-2xl font-semibold text-brand-strong">Conecte seu cônjuge</h2>
          <p className="mt-2 text-muted">
            Convide seu cônjuge para criar a conta dele(a). Cada pessoa responderá individualmente, e nenhuma resposta privada será compartilhada automaticamente.
          </p>
        </div>
        <CoupleInviteForm />
      </Card>
    );
  }

  if (overview.state === "PENDING") {
    return (
      <div className="mx-auto grid max-w-3xl gap-6">
        {error ? <Alert variant="error">{error}</Alert> : null}
        <Card>
          <Badge>Aguardando aceite</Badge>
          <h2 className="mt-4 font-serif text-2xl font-semibold text-brand-strong">Vínculo aguardando seu cônjuge</h2>
          {overview.invite ? (
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="font-semibold">E-mail convidado</dt><dd className="break-all text-muted">{overview.invite.email}</dd></div>
              <div><dt className="font-semibold">Expira em</dt><dd className="text-muted">{formatDate(overview.invite.expiresAt)}</dd></div>
            </dl>
          ) : <p className="mt-3 text-muted">Não existe convite ativo no momento.</p>}
        </Card>
        <Card>
          <h3 className="font-semibold text-brand-strong">{overview.invite ? "Gerar novo link" : "Criar novo convite"}</h3>
          <div className="mt-4"><CoupleInviteForm defaultEmail={overview.invite?.email} regenerate={Boolean(overview.invite)} /></div>
        </Card>
        <Card className="space-y-4">
          <h3 className="font-semibold text-brand-strong">Gerenciar vínculo pendente</h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            {overview.invite ? <form action={cancelCoupleInviteAction}><Button type="submit" variant="secondary">Cancelar convite</Button></form> : null}
            <form action={cancelPendingCoupleAction}><Button type="submit" variant="danger">Cancelar vínculo pendente</Button></form>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      {error ? <Alert variant="error" className="mb-5">{error}</Alert> : null}
      <Badge>Relacionamento conectado</Badge>
      <h2 className="mt-4 font-serif text-2xl font-semibold text-brand-strong">Seu relacionamento está conectado</h2>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><dt className="text-sm font-semibold">Parceiro(a)</dt><dd className="text-muted">{overview.partner.name}</dd></div>
        <div><dt className="text-sm font-semibold">E-mail</dt><dd className="break-all text-muted">{overview.partner.email}</dd></div>
        <div><dt className="text-sm font-semibold">Seu papel</dt><dd className="text-muted">{overview.role === "CREATOR" ? "Criador do vínculo" : "Parceiro"}</dd></div>
        <div><dt className="text-sm font-semibold">Conectado em</dt><dd className="text-muted">{formatDate(overview.joinedAt)}</dd></div>
      </dl>
      <Alert className="mt-6">O vínculo conecta somente as contas. Nenhuma resposta, nota ou informação privada é compartilhada nesta etapa.</Alert>
      <Link
        href="/casal/comparacao"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
      >
        Acessar comparação
      </Link>
    </Card>
  );
}
