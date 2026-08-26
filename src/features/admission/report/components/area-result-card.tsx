import { Badge, Card } from "@/components/ui";
import type { AdmissionReportAreaDto } from "@/types/admission-report";

const badgeStyles = {
  PONTO_FORTE: "bg-sky-100 text-sky-950",
  PONTO_DE_ATENCAO: "bg-amber-100 text-amber-950",
  AREA_PRIORITARIA: "bg-violet-100 text-violet-950",
} as const;

export function AreaResultCard({ area }: { area: AdmissionReportAreaDto }) {
  const average = Number(area.averageScore);
  const barWidth = Math.min(100, Math.max(0, average / 2 * 100));
  const accessibleAverage = average.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-xl font-semibold leading-snug text-brand-strong">{area.name}</h3>
        <Badge className={badgeStyles[area.classification]}>{area.classificationTitle}</Badge>
      </div>
      <p className="mt-3 text-sm text-muted">{area.description}</p>
      <div className="mt-5">
        <div className="flex items-end justify-between gap-3 text-sm">
          <span className="font-semibold text-brand-strong">{area.score} de {area.maxScore}</span>
          <span className="text-muted">Média {accessibleAverage} de 2</span>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-label={`${area.name}: média ${accessibleAverage} de 2, classificada como ${area.classificationTitle.toLowerCase()}.`}
          aria-valuemin={0}
          aria-valuemax={2}
          aria-valuenow={average}
        >
          <div className="h-full rounded-full bg-brand/70" style={{ width: `${barWidth}%` }} />
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">{area.classificationSummary}</p>
    </Card>
  );
}
