import type { Metadata } from "next";
import Link from "next/link";
import { Alert, Badge, Card, PageContainer, ProgressBar } from "@/components/ui";

export const metadata: Metadata = { title: "Questionário de admissão" };

export default function QuestionnairePage() {
  return (
    <PageContainer className="py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3"><Badge>Demonstração</Badge><span className="text-sm text-muted">Questão 1 de 33</span></div>
        <h1 className="mt-5 font-serif text-3xl text-brand-strong sm:text-4xl">Questionário de admissão</h1>
        <div className="mt-7"><ProgressBar value={3} label="Seu progresso" /></div>
        <Card className="mt-8 p-6 sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Visão inicial</p>
          <h2 className="mt-3 text-xl font-semibold text-brand-strong sm:text-2xl">Como você imagina a construção das decisões importantes na vida a dois?</h2>
          <fieldset className="mt-7 space-y-3" disabled>
            <legend className="sr-only">Escolha uma resposta</legend>
            {["Sempre em conjunto", "Depende do tema", "Com responsabilidades previamente divididas"].map((option) => (
              <label key={option} className="flex min-h-12 items-center gap-3 rounded-xl border border-line bg-white px-4 text-muted"><input type="radio" name="demo-answer" />{option}</label>
            ))}
          </fieldset>
        </Card>
        <Alert variant="warning" title="Questionário ainda não disponível" className="mt-6">A lógica de respostas, persistência e validação será implementada em uma etapa futura.</Alert>
        <div className="mt-7 flex justify-between"><Link href="/admissao" className="font-semibold text-brand hover:underline">Voltar</Link><Link href="/admissao/resultado" className="font-semibold text-brand hover:underline">Ver tela de resultado</Link></div>
      </div>
    </PageContainer>
  );
}
