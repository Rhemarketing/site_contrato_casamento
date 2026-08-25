import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getSafeCallbackUrl } from "@/lib/auth/callback-url";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const callbackUrl = getSafeCallbackUrl((await searchParams).callbackUrl);
  if (await getCurrentUser()) redirect(callbackUrl);
  return <AuthShell title="Bem-vindo de volta" description="Entre para continuar sua jornada com segurança." footer={<>Ainda não tem conta? <Link className="font-semibold text-brand hover:underline" href={`/cadastro?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Cadastre-se</Link></>}><LoginForm callbackUrl={callbackUrl} /></AuthShell>;
}
