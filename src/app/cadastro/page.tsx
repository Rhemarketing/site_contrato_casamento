import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegistrationForm } from "@/components/auth/registration-form";
import { getSafeCallbackUrl } from "@/lib/auth/callback-url";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = { title: "Cadastro" };

export default async function RegistrationPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const callbackUrl = getSafeCallbackUrl((await searchParams).callbackUrl);
  if (await getCurrentUser()) redirect(callbackUrl);
  return <AuthShell title="Crie seu espaço" description="Seu cadastro será individual, mesmo quando fizer parte de um casal." footer={<>Já possui uma conta? <Link className="font-semibold text-brand hover:underline" href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Entrar</Link></>}><RegistrationForm callbackUrl={callbackUrl} /></AuthShell>;
}
