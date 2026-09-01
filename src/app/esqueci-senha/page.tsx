import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Esqueci minha senha", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recupere seu acesso"
      description="Informe seu e-mail para receber um link de redefinição de senha."
      footer={<Link className="font-semibold text-brand hover:underline" href="/login">Voltar para o login</Link>}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
