import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AcceptInviteForm } from "@/features/couple/components/accept-invite-form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { CoupleInviteService } from "@/services/couple-invite.service";

export const metadata: Metadata = {
  title: "Convite para relacionamento",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export const dynamic = "force-dynamic";
export const revalidate = 0;

function stateMessage(state: "EXPIRED" | "CANCELLED" | "ACCEPTED" | "UNAVAILABLE") {
  if (state === "EXPIRED") return "Este convite expirou.";
  if (state === "CANCELLED") return "Este convite não está mais disponível.";
  if (state === "ACCEPTED") return "Este convite já foi utilizado.";
  return "Este convite não está disponível.";
}

export default async function CoupleInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [preview, user] = await Promise.all([
    new CoupleInviteService(db).getInvitePreview(token),
    getCurrentUser(),
  ]);
  const callbackUrl = `/convite/${token}`;

  return (
    <WorkspacePage
      eyebrow="Convite individual"
      title="Conecte seu relacionamento"
      description="O aceite é explícito e conecta somente as duas contas. Nenhuma resposta é compartilhada automaticamente."
    >
      <Card className="mx-auto max-w-xl space-y-6">
        {preview.state === "AVAILABLE" ? (
          <>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-brand-strong">{preview.creatorName} convidou você</h2>
              <p className="mt-2 text-muted">Este convite foi destinado a {preview.recipientEmail}.</p>
            </div>
            <Alert>Entre com a conta correspondente ao e-mail mascarado acima e confirme o aceite.</Alert>
            {user ? (
              <AcceptInviteForm token={token} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}><Button fullWidth>Entrar para aceitar</Button></Link>
                <Link href={`/cadastro?callbackUrl=${encodeURIComponent(callbackUrl)}`}><Button fullWidth variant="secondary">Criar conta para aceitar</Button></Link>
              </div>
            )}
          </>
        ) : (
          <Alert title="Convite indisponível" variant={preview.state === "EXPIRED" ? "warning" : "info"}>
            {stateMessage(preview.state)}
          </Alert>
        )}
      </Card>
    </WorkspacePage>
  );
}
