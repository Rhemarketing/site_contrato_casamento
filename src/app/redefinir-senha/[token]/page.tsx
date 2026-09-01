import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Alert } from "@/components/ui/alert";
import { createPasswordResetService } from "@/services/password-reset.factory";

export const metadata: Metadata = { title: "Redefinir senha", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const revalidate = 0;

const stateContent = {
  INVALID: { title: "Link inválido", message: "Este link de redefinição não é válido. Solicite um novo link para continuar." },
  EXPIRED: { title: "Link expirado", message: "Este link expirou. Solicite uma nova redefinição de senha." },
  USED: { title: "Link indisponível", message: "Este link já foi utilizado ou substituído por uma solicitação mais recente." },
} as const;

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const state = await createPasswordResetService().preview(token);
  if (state !== "VALID") {
    const content = stateContent[state];
    return (
      <AuthShell
        title={content.title}
        description="Protegemos sua conta validando cada link antes de permitir alterações."
        footer={<Link className="font-semibold text-brand hover:underline" href="/esqueci-senha">Solicitar novo link</Link>}
      >
        <Alert variant="error">{content.message}</Alert>
      </AuthShell>
    );
  }
  return (
    <AuthShell
      title="Crie uma nova senha"
      description="Escolha uma senha nova e exclusiva para sua conta."
      footer={<Link className="font-semibold text-brand hover:underline" href="/login">Voltar para o login</Link>}
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
