import { Card } from "@/components/ui";
import { formatScoreRating } from "@/features/admission/domain/score-presentation";
import { cn } from "@/lib/cn";
import type { AdmissionIndividualReportDto } from "@/types/admission-report";
import { ScoreStatusBadge, scoreLevelStyles } from "./score-status-badge";

export function GeneralScoreCard({ general }: { general: AdmissionIndividualReportDto["general"] }) {
  const styles = scoreLevelStyles[general.level];
  return (
    <section aria-labelledby="general-result-heading" className="mt-10">
      <Card className={cn("report-reveal relative isolate overflow-hidden p-0 shadow-[0_24px_70px_-28px]", styles.panel)}>
        <span className={cn("report-float absolute -right-16 -top-20 -z-10 size-56 rounded-full blur-3xl", styles.glow)} aria-hidden="true" />
        <span className={cn("absolute -bottom-24 left-1/4 -z-10 size-48 rounded-full blur-3xl", styles.glow)} aria-hidden="true" />
        <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
          <div className="flex flex-col justify-center border-b border-white/65 px-6 py-8 sm:px-10 sm:py-10 lg:border-b-0 lg:border-r">
            <p className={cn("text-xs font-bold uppercase tracking-[0.18em]", styles.mutedText)}>Pontuação geral</p>
            <p className={cn("mt-3 font-serif text-5xl sm:text-7xl", styles.text)}>
              <strong>{formatScoreRating(general.rating)}</strong>
              <span className={cn("ml-2 text-2xl sm:text-3xl", styles.mutedText)}>/ {general.ratingMax}</span>
            </p>
            <p className={cn("mt-3 max-w-xs text-sm", styles.mutedText)}>Quanto maior a nota, melhor a percepção registrada.</p>
          </div>
          <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10">
            <h2 id="general-result-heading" className="sr-only">Resultado geral do relacionamento</h2>
            <ScoreStatusBadge className="w-fit" level={general.level} title={general.statusTitle} />
            <p className={cn("mt-5 max-w-2xl text-base leading-relaxed sm:text-lg", styles.mutedText)}>{general.statusDescription}</p>
          </div>
        </div>
      </Card>
    </section>
  );
}
