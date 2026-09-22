import Image from "next/image";
import Link from "next/link";
import { PageContainer } from "@/components/ui/page-container";

const steps = [
  {
    number: "01",
    tag: "Etapa 1 • Individual",
    badgeTime: "10 a 15 min",
    title: "Avaliação gratuita",
    description:
      "Faça o teste de 40 perguntas individualmente para mapear a saúde da relação, identificar pontos fortes e áreas que precisam de atenção.",
    icon: (
      <svg className="size-6 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <circle cx="12" cy="11" r="2.5" />
      </svg>
    ),
  },
  {
    number: "02",
    tag: "Etapa 2 • Bilateral",
    badgeTime: "1 clique",
    title: "Conectar com o parceiro",
    description:
      "Envie um convite seguro pelo WhatsApp para seu cônjuge se conectar à sua conta com total sigilo e privacidade das respostas individuais.",
    icon: (
      <svg className="size-6 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="12" r="5" />
        <circle cx="16" cy="12" r="5" />
        <path d="M12 9.2a5 5 0 0 0 0 5.6" strokeWidth="2.2" />
      </svg>
    ),
  },
  {
    number: "03",
    tag: "Etapa 3 • A Dois",
    badgeTime: "No seu ritmo",
    title: "Questionário profundo",
    description:
      "Ambos respondem questões mais profundas sobre finanças, intimidade, convivência e planos futuros, alinhando expectativas reais.",
    icon: (
      <svg className="size-6 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </svg>
    ),
  },
  {
    number: "04",
    tag: "Etapa 4 • Pacto Selado",
    badgeTime: "Imediato",
    title: "Obter contrato",
    description:
      "Receba o Contrato de Casamento personalizado do casal: um manual completo com cláusulas e acordos práticos construídos pelos dois.",
    highlight: true,
    icon: (
      <svg className="size-6 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="m15.4 12.8 2.6 7.2-4.5-2.2-1.5.8-1.5-.8-4.5 2.2 2.6-7.2" />
        <circle cx="12" cy="8" r="2.5" fill="rgba(245, 215, 130, 0.45)" />
      </svg>
    ),
  },
];

const stats = [
  {
    value: "+1.200",
    label: "Casais impactados",
    description: "Já realizaram a avaliação diagnóstica e deram o primeiro passo.",
  },
  {
    value: "96%",
    label: "Menos brigas repetitivas",
    description: "Relataram redução expressiva em discussões sobre os mesmos temas.",
  },
  {
    value: "98%",
    label: "Mais clareza e diálogo",
    description: "Conseguiram conversar sobre assuntos difíceis com tranquilidade e respeito.",
  },
  {
    value: "4.9 / 5",
    label: "Índice de satisfação",
    description: "Avaliação média dos casais após criarem seu Contrato personalizado.",
  },
];

const faqs = [
  {
    question: "O que é o Contrato de Casamento e ele tem validade jurídica?",
    answer:
      "O Contrato de Casamento é um método estruturado de alinhamento relacional e regras práticas de convivência para o casal. Não se trata de um documento jurídico de cartório, mas sim de um compromisso mútuo — um verdadeiro manual personalizado da relação, construído pelos dois para prevenir desgastes, alinhar decisões e proteger o casamento.",
  },
  {
    question: "Meu parceiro terá acesso às minhas respostas individuais?",
    answer:
      "Não. A privacidade é um princípio fundamental da plataforma. Suas respostas individuais permanecem em absoluto sigilo e nunca são exibidas ao cônjuge. O sistema apenas cruza as percepções de ambos para identificar convergências, áreas de atenção e sugerir cláusulas conjuntas no documento final.",
  },
  {
    question: "E se o meu cônjuge não quiser participar no início?",
    answer:
      "Você pode começar fazendo a sua Avaliação Gratuita de 40 perguntas individualmente. Ao receber o seu relatório com o raio-x da relação, você terá muito mais clareza para conversar com seu parceiro e convidá-lo a participar de forma leve e natural, sem cobranças ou brigas.",
  },
  {
    question: "Quanto tempo leva para responder os questionários e gerar o contrato?",
    answer:
      "A primeira avaliação de admissão leva de 10 a 15 minutos. O questionário profundo seguinte pode ser respondido no próprio ritmo de cada um, salvando o progresso automaticamente. Assim que ambos concluem, o documento personalizado do casal é gerado instantaneamente.",
  },
  {
    question: "O método serve apenas para casais em crise ou também para relações saudáveis?",
    answer:
      "Serve para qualquer casal que deseja cuidar do casamento. Casais que enfrentam conflitos encontram um caminho claro para romper ciclos de desgaste e brigas repetitivas. Já casais com boa convivência utilizam o contrato para blindar o relacionamento contra a rotina, preservar o que funciona e planejar o futuro juntos.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="overflow-hidden border-b border-line bg-surface">
        <PageContainer className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
          <div>
            <h1 className="mx-auto max-w-3xl text-center font-serif text-4xl leading-tight text-brand-strong sm:mx-0 sm:text-left sm:text-6xl sm:leading-[1.08]">
              Casamento Feliz Começa com Acordo
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-muted sm:mx-0 sm:text-left sm:text-xl">
              Identifique os atritos do relacionamento e crie um contrato com regras de convivência que funcionam para os dois.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-strong" href="/cadastro?callbackUrl=%2Fadmissao%2Fquestionario">
                Examinar saúde do casamento
              </Link>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-sm justify-center sm:max-w-md lg:max-w-none">
            <Image
              src="/images/contrato-hero.png"
              alt="Exemplo do Contrato de Casamento"
              width={1046}
              height={1205}
              priority
              className="-mb-[50px] -mt-[25px] h-auto w-full max-w-[360px] drop-shadow-[0_16px_36px_rgba(25,45,56,0.12)] sm:mb-0 sm:mt-0 sm:max-w-[420px] lg:-mb-[70px] lg:-mt-[75px] lg:max-w-full"
              sizes="(max-width: 640px) 360px, (max-width: 1024px) 420px, 500px"
            />
          </div>
        </PageContainer>
      </section>

      <section className="gold-luxury-section py-16 text-white sm:py-24 lg:py-28">
        <div className="gold-luxury-texture" aria-hidden="true" />
        <div className="gold-glow-beam" aria-hidden="true" />

        <PageContainer className="relative z-10 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif text-3xl font-extrabold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-4xl lg:text-5xl">
              Transforme seu Casamento!
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-amber-50 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)] sm:text-lg">
              Mais de 1.200 casais já transformaram atritos e desgastes silenciosos em cumplicidade, intimidade e harmonia na vida a dois.
            </p>
          </div>

          <div className="mx-auto mt-10 w-full max-w-3xl sm:mt-12">
            <div className="gold-frame">
              <div className="relative aspect-video w-full overflow-hidden rounded-[1rem] bg-black">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Vídeo explicativo sobre o Contrato de Casamento"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center sm:mt-12">
            <Link
              href="/cadastro?callbackUrl=%2Fadmissao%2Fquestionario"
              className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-amber-300/40 bg-brand-strong px-9 py-4 text-base font-bold text-white shadow-[0_12px_32px_rgba(15,30,40,0.45)] transition duration-200 hover:scale-[1.02] hover:bg-brand hover:shadow-[0_16px_40px_rgba(15,30,40,0.55)] sm:w-auto"
            >
              Transformar agora!
            </Link>
            <p className="mt-3 text-xs font-medium text-amber-100/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] sm:text-sm">
              Avaliação Gratuíta • Resultado imediato
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="border-b border-line bg-surface py-14 sm:py-20">
        <PageContainer>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent sm:text-sm">
              Resultados Comprovados
            </p>
            <h2 className="mt-2.5 font-serif text-2xl font-bold text-brand-strong sm:text-3xl lg:text-4xl">
              A eficácia do método comprovada por quem já viveu a mudança
            </h2>
            <p className="mt-3 text-sm text-muted sm:text-base">
              Avaliações e relatos de casais que decidiram sair do desgaste e construir uma convivência mais leve e harmoniosa.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-line bg-background p-5 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md sm:p-7"
              >
                <div>
                  <span className="font-serif text-3xl font-extrabold tracking-tight text-brand-strong sm:text-4xl lg:text-5xl">
                    {stat.value}
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-brand-strong sm:text-base">
                    {stat.label}
                  </h3>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted sm:text-sm">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section id="passo-a-passo" className="dark-roadmap-section py-20 sm:py-28">
        <div className="dark-roadmap-texture" />

        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-3/4 max-w-4xl -translate-x-1/2 rounded-full bg-cyan-600/10 blur-[100px]" />

        <PageContainer className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              Passo a Passo da Transformação
            </div>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Como obter seu Contrato de Casamento
            </h2>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              4 etapas práticas e estruturadas para transformar atritos silenciosos em clareza, proteção e cumplicidade duradoura na vida a dois.
            </p>
          </div>

          <div className="relative mt-14 sm:mt-18">
            {/* Desktop Connector Line Behind Cards */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-14 left-[8%] right-[8%] hidden h-[2px] bg-gradient-to-r from-amber-400/20 via-amber-400/50 to-amber-300/80 lg:block -z-0"
            />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, idx) => (
                <div
                  key={step.number}
                  className={`group flex flex-col justify-between ${
                    step.highlight ? "dark-step-card-gold" : "dark-step-card"
                  }`}
                >
                  {/* Top Bar inside Card */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={`relative flex size-12 shrink-0 items-center justify-center rounded-xl border shadow-inner ${
                          step.highlight
                            ? "border-amber-400/60 bg-amber-500/20 shadow-[0_0_15px_rgba(216,176,86,0.3)]"
                            : "border-[#315b6d] bg-[#0c222c] shadow-[0_0_12px_rgba(0,0,0,0.5)]"
                        }`}
                      >
                        {step.icon}
                        {/* Ping indicator on Step 4 */}
                        {step.highlight && (
                          <span className="absolute -top-1 -right-1 flex size-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
                            <span className="relative inline-flex size-3 rounded-full bg-amber-400" />
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col items-end">
                        <span
                          className={`font-serif text-2xl font-black tracking-tight sm:text-3xl ${
                            step.highlight ? "text-amber-300" : "text-amber-400/80"
                          }`}
                        >
                          {step.number}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider ${
                            step.highlight ? "text-amber-200" : "text-slate-400"
                          }`}
                        >
                          {step.badgeTime}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5">
                      <span
                        className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                          step.highlight
                            ? "border border-amber-400/40 bg-amber-400/20 text-amber-200"
                            : "border border-cyan-800/50 bg-[#0e2733] text-cyan-300"
                        }`}
                      >
                        {step.tag}
                      </span>
                      <h3 className="mt-3 text-lg font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-amber-200">
                        {step.title}
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Desktop Step Arrow Indicator to Next Step */}
                  {idx < steps.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="absolute -right-3.5 top-14 z-20 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full border border-amber-400/40 bg-[#0a1820] text-amber-300 shadow-md transition-transform duration-200 group-hover:scale-110 lg:flex"
                    >
                      <svg
                        className="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  )}

                  {/* Card Bottom status for Step 4 */}
                  {step.highlight && (
                    <div className="mt-6 flex items-center justify-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 py-1.5 text-xs font-bold text-amber-200">
                      <svg
                        className="size-3.5 text-amber-300"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Documento Personalizado do Casal
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA & Trust badges */}
          <div className="mt-14 flex flex-col items-center justify-center text-center sm:mt-16">
            <Link
              href="/cadastro?callbackUrl=%2Fadmissao%2Fquestionario"
              className="group relative inline-flex min-h-13 items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#d4a746] via-[#f3cf7a] to-[#c89732] px-9 py-4 text-base font-bold text-slate-950 shadow-[0_10px_25px_rgba(212,167,70,0.35)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_16px_36px_rgba(212,167,70,0.5)] active:scale-[0.98]"
            >
              <span className="relative z-10 font-bold tracking-wide">
                Começar com a avaliação gratuita
              </span>
              <svg
                className="size-4.5 text-slate-950 transition-transform duration-200 group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="size-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                100% Gratuito
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="size-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Sigilo individual garantido
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="size-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Sem necessidade de cartão
              </span>
            </div>
          </div>
        </PageContainer>
      </section>

      <section id="duvidas" className="border-t border-line bg-surface py-16 sm:py-24">
        <PageContainer>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent sm:text-sm">
              Tire suas dúvidas
            </p>
            <h2 className="mt-2.5 font-serif text-3xl font-bold text-brand-strong sm:text-4xl">
              Dúvidas Frequentes
            </h2>
            <p className="mt-3 text-base text-muted">
              Tudo o que você precisa saber sobre como funciona o método e o Contrato de Casamento.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-line bg-background transition duration-200 open:border-accent/50 open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-left font-semibold text-brand-strong sm:p-6 sm:text-lg [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <span className="ml-4 flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface transition duration-200 group-open:rotate-180">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-line/60 px-5 pb-6 pt-4 text-sm leading-relaxed text-muted sm:px-6 sm:text-base">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-14 text-center">
            <p className="text-sm text-muted sm:text-base">
              Ainda tem alguma dúvida? Experimente sem compromisso.
            </p>
            <div className="mt-4 flex justify-center">
              <Link
                href="/cadastro?callbackUrl=%2Fadmissao%2Fquestionario"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-strong sm:w-auto"
              >
                Iniciar Avaliação Gratuita
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
