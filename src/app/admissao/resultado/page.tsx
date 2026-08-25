import type { Metadata } from "next";
import Link from "next/link";
import { Alert, Badge, Card, PageContainer } from "@/components/ui";
import { requireUser } from "@/lib/auth/current-user";

export const metadata: Metadata = { title: "Resultado individual" };

export default async function AdmissionResultPage() {
  await requireUser("/admissao/resultado");
  return (
    <PageContainer className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Badge>Resultado individual</Badge>
        <h1 className="mt-5 font-serif text-4xl text-brand-strong sm:text-5xl">Sua reflexão aparecerá aqui.</h1>
        <p className="mt-4 text-lg text-muted">Quando o questionário estiver disponível, esta área reunirá apenas as informações autorizadas para o seu resultado pessoal.</p>
        <Card className="mt-8"><div className="grid gap-5 sm:grid-cols-3">{["Valores", "Expectativas", "Planos"].map((topic) => <div key={topic} className="rounded-xl bg-background p-4"><p className="text-sm text-muted">Tema</p><p className="mt-1 font-semibold text-brand-strong">{topic}</p></div>)}</div></Card>
        <Alert className="mt-6" title="Privacidade preservada">Nenhuma resposta privada será incluída em notas, comparações, analytics ou visualizações do parceiro.</Alert>
        <Link href="/dashboard" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-brand px-6 font-semibold text-white hover:bg-brand-strong">Ir para o painel</Link>
      </div>
    </PageContainer>
  );
}
