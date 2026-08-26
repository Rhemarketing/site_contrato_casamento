import { Card } from "@/components/ui";
import type { AdmissionIndividualReportDto } from "@/types/admission-report";

export function GeneralScoreCard({ general }: { general: AdmissionIndividualReportDto["general"] }) {
  return (
    <section aria-labelledby="general-result-heading" className="mt-10">
      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[0.75fr_1.25fr]">
          <div className="flex flex-col justify-center bg-brand px-6 py-8 text-white sm:px-9">
            <p className="text-sm font-semibold uppercase tracking-wider text-white/75">Indicador geral</p>
            <p className="mt-3 font-serif text-5xl sm:text-6xl"><strong>{general.totalScore}</strong><span className="ml-2 text-2xl text-white/75">de {general.maxScore}</span></p>
            <p className="mt-4 text-sm leading-relaxed text-white/80">Nesta avaliação, pontuações mais altas indicam maior quantidade ou intensidade de pontos que merecem atenção.</p>
          </div>
          <div className="px-6 py-8 sm:px-9">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Classificação</p>
            <h2 id="general-result-heading" className="mt-2 font-serif text-3xl text-brand-strong">{general.title}</h2>
            <p className="mt-4 text-muted">{general.summary}</p>
            <p className="mt-3 text-muted">{general.recommendation}</p>
          </div>
        </div>
      </Card>
    </section>
  );
}
