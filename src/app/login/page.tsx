import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, Button, Input } from "@/components/ui";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return <AuthShell title="Bem-vindo de volta" description="Entre para continuar sua jornada com segurança." footer={<>Ainda não tem conta? <Link className="font-semibold text-brand hover:underline" href="/cadastro">Cadastre-se</Link></>}>
    <form className="space-y-5"><Input id="login-email" name="email" type="email" label="E-mail" placeholder="voce@exemplo.com" autoComplete="email" /><Input id="login-password" name="password" type="password" label="Senha" autoComplete="current-password" /><Button type="submit" fullWidth disabled>Entrar</Button></form>
    <Alert variant="warning" className="mt-5">A autenticação será ativada em uma etapa futura.</Alert>
  </AuthShell>;
}
