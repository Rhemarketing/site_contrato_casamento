import { Card } from "@/components/ui";
import { formatScoreRating } from "@/features/admission/domain/score-presentation";
import { cn } from "@/lib/cn";
import type { AdmissionReportAreaDto } from "@/types/admission-report";
import { ScoreStatusBadge, scoreLevelStyles } from "./score-status-badge";

export function AreaResultCard({ area, position = 0 }: { area: AdmissionReportAreaDto; position?: number }) {
  const formattedRating = formatScoreRating(area.rating);
  const barWidth = Math.min(100, Math.max(0, area.rating / area.ratingMax * 100));
  const styles = scoreLevelStyles[area.level];
  return (
    <Card
      className={cn(
        "report-motion report-reveal group relative isolate flex h-full flex-col overflow-hidden p-5 shadow-[0_18px_50px_-28px] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px] sm:p-6",
        styles.panel,
      )}
      style={{ animationDelay: `${Math.min(position, 8) * 75}ms` }}
    >
      <span className={cn("absolute -right-10 -top-12 -z-10 size-32 rounded-full blur-2xl transition duration-500 group-hover:scale-125", styles.glow)} aria-hidden="true" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className={cn("max-w-[19rem] text-xl font-semibold leading-snug", styles.text)}>{area.name}</h3>
        <ScoreStatusBadge level={area.level} title={area.statusTitle} />
      </div>
      <p className={cn("mt-3 text-sm leading-relaxed", styles.mutedText)}>{area.description}</p>
      <div className={cn("mt-5 rounded-2xl border p-4 backdrop-blur-sm", styles.soft)}>
        <div className="flex items-end justify-between gap-3">
          <span className={cn("font-serif text-4xl font-semibold leading-none", styles.text)}>{formattedRating} <span className={cn("text-lg", styles.mutedText)}>/ {area.ratingMax}</span></span>
          <span className={cn("text-xs font-semibold uppercase tracking-wider", styles.mutedText)}>Nota da área</span>
        </div>
        <div
          className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/75 shadow-inner"
          role="progressbar"
          aria-label={`${area.name}: nota ${formattedRating} de ${area.ratingMax}, classificada como ${area.statusTitle.toLowerCase()}.`}
          aria-valuemin={0}
          aria-valuemax={area.ratingMax}
          aria-valuenow={area.rating}
        >
          <div className={cn("report-progress h-full rounded-full shadow-sm", styles.bar)} style={{ width: `${barWidth}%` }} />
        </div>
      </div>
      <p className={cn("mt-4 text-sm leading-relaxed", styles.mutedText)}>{area.statusDescription}</p>
    </Card>
  );
}
