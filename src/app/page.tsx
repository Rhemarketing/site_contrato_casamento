import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";

const pillars = [
  {
    number: "01",
    title: "Clareza antes do compromisso",
    description: "Perguntas cuidadosas ajudam a tornar expectativas invisíveis em conversas possíveis.",
  },
  {
    number: "02",
    title: "Privacidade por princípio",
    description: "Cada pessoa controla o que é pessoal. Respostas sensíveis nunca são compartilhadas automaticamente.",
  },
  {
    number: "03",
    title: "Decisões construídas a dois",
    description: "O objetivo não é julgar o casal, mas oferecer um ponto de partida responsável para o diálogo.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="overflow-hidden border-b border-line bg-surface">
        <PageContainer className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
          <div>
            <Badge>Conversas que aproximam</Badge>
            <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-tight text-brand-strong sm:text-6xl sm:leading-[1.08]">
              Um compromisso sólido começa com conversas honestas.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">
              O Contrato de Casamento cria um espaço acolhedor para vocês entenderem valores, expectativas e planos antes de dar o próximo passo.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-strong" href="/admissao">
                Fazer minha Prova de Admissão
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-surface px-6 py-3 font-semibold text-brand transition hover:border-brand" href="/cadastro">
                Criar uma conta
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
            <div className="absolute -inset-6 rotate-3 rounded-[2.5rem] bg-accent-soft" />
            <div className="relative rounded-[2rem] border border-line bg-background p-7 shadow-[0_24px_70px_rgba(25,45,56,0.12)] sm:p-9">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Para refletir</p>
              <p className="mt-6 font-serif text-3xl leading-snug text-brand-strong">“Como queremos cuidar da nossa vida em comum?”</p>
              <div className="mt-10 h-px bg-line" />
              <div className="mt-6 flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-full bg-brand text-lg text-white">CC</span>
                <p className="text-sm text-muted">Sem pressa. Sem respostas certas. Com respeito.</p>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-16 sm:py-24">
        <PageContainer>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Nossa abordagem</p>
            <h2 className="mt-3 font-serif text-3xl text-brand-strong sm:text-4xl">Profundidade com delicadeza</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {pillars.map((pillar) => (
              <Card key={pillar.number} className="h-full">
                <span className="font-serif text-2xl text-accent">{pillar.number}</span>
                <h3 className="mt-8 text-xl font-semibold text-brand-strong">{pillar.title}</h3>
                <p className="mt-3 text-muted">{pillar.description}</p>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>
    </>
  );
}
