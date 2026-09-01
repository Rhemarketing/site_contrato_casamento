import { Card } from "@/components/ui";
import { formatScoreRating } from "@/features/admission/domain/score-presentation";
import { cn } from "@/lib/cn";
import type { AdmissionReportAreaDto } from "@/types/admission-report";
import { ScoreStatusBadge, scoreLevelStyles } from "./score-status-badge";

export function AreaResultCard({ area }: { area: AdmissionReportAreaDto }) {
  const formattedRating = formatScoreRating(area.rating);
  const barWidth = Math.min(100, Math.max(0, area.rating / area.ratingMax * 100));
  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-xl font-semibold leading-snug text-brand-strong">{area.name}</h3>
        <ScoreStatusBadge level={area.level} title={area.statusTitle} />
      </div>
      <p className="mt-3 text-sm text-muted">{area.description}</p>
      <div className="mt-5">
        <div className="flex items-end justify-between gap-3 text-sm">
          <span className="font-serif text-3xl font-semibold text-brand-strong">{formattedRating} <span className="text-lg text-muted">/ {area.ratingMax}</span></span>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-label={`${area.name}: nota ${formattedRating} de ${area.ratingMax}, classificada como ${area.statusTitle.toLowerCase()}.`}
          aria-valuemin={0}
          aria-valuemax={area.ratingMax}
          aria-valuenow={area.rating}
        >
          <div className={cn("h-full rounded-full", scoreLevelStyles[area.level].bar)} style={{ width: `${barWidth}%` }} />
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">{area.statusDescription}</p>
    </Card>
  );
}
