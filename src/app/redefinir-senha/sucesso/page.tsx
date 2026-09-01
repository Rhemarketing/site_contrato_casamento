import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Senha alterada", robots: { index: false, follow: false } };

export default function PasswordResetSuccessPage() {
  return (
    <AuthShell
      title="Senha alterada com sucesso"
      description="Sua nova senha já está pronta para uso."
      footer={<Link className="font-semibold text-brand hover:underline" href="/login">Entrar com a nova senha</Link>}
    >
      <Alert variant="success">Agora você pode retornar ao login e acessar sua conta com a nova senha.</Alert>
    </AuthShell>
  );
}
