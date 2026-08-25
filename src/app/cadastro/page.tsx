import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, Button, Input } from "@/components/ui";

export const metadata: Metadata = { title: "Cadastro" };

export default function RegistrationPage() {
  return <AuthShell title="Crie seu espaço" description="Seu cadastro será individual, mesmo quando fizer parte de um casal." footer={<>Já possui uma conta? <Link className="font-semibold text-brand hover:underline" href="/login">Entrar</Link></>}>
    <form className="space-y-5"><Input id="registration-name" name="name" label="Nome" autoComplete="name" /><Input id="registration-email" name="email" type="email" label="E-mail" autoComplete="email" /><Input id="registration-password" name="password" type="password" label="Senha" hint="Use ao menos 8 caracteres." autoComplete="new-password" /><Button type="submit" fullWidth disabled>Criar conta</Button></form>
    <Alert variant="warning" className="mt-5">O envio do cadastro será ativado em uma etapa futura.</Alert>
  </AuthShell>;
}
