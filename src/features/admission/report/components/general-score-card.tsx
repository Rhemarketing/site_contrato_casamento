import { Card } from "@/components/ui";
import { formatScoreRating } from "@/features/admission/domain/score-presentation";
import { cn } from "@/lib/cn";
import type { AdmissionIndividualReportDto } from "@/types/admission-report";
import { ScoreStatusBadge, scoreLevelStyles } from "./score-status-badge";

export function GeneralScoreCard({ general }: { general: AdmissionIndividualReportDto["general"] }) {
  return (
    <section aria-labelledby="general-result-heading" className="mt-10">
      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[0.75fr_1.25fr]">
          <div className={cn("flex flex-col justify-center px-6 py-8 text-white sm:px-9", scoreLevelStyles[general.level].panel)}>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/75">Indicador geral</p>
            <p className="mt-3 font-serif text-5xl sm:text-6xl">
              <strong>{formatScoreRating(general.rating)}</strong>
              <span className="ml-2 text-2xl text-white/75">/ {general.ratingMax}</span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/85">Quanto maior a nota, melhor o resultado percebido.</p>
          </div>
          <div className="px-6 py-8 sm:px-9">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Classificação geral</p>
            <h2 id="general-result-heading" className="sr-only">Resultado geral do relacionamento</h2>
            <ScoreStatusBadge className="mt-3" level={general.level} title={general.statusTitle} />
            <p className="mt-5 text-muted">{general.statusDescription}</p>
          </div>
        </div>
      </Card>
    </section>
  );
}
