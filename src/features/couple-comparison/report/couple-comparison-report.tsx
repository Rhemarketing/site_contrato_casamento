import { revokeCoupleComparisonConsent } from "@/app/actions/couple.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CoupleComparisonReportDto } from "@/types/couple-comparison-report";
import { ComparisonAreaCard } from "./comparison-area-card";
import { ComparisonGuidance } from "./comparison-guidance";
import { ComparisonHighlights } from "./comparison-highlights";
import { ComparisonSummary } from "./comparison-summary";

export function CoupleComparisonReport({ report }: { report: CoupleComparisonReportDto }) {
  return (
    <article className="mx-auto grid max-w-6xl gap-10 sm:gap-12">
      <ComparisonSummary report={report} />
      <section aria-labelledby="comparison-areas-title">
        <div className="mb-6 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Panorama por tema</p>
          <h2 id="comparison-areas-title" className="mt-2 font-serif text-3xl font-semibold text-brand-strong">As nove áreas do relacionamento</h2>
          <p className="mt-3 text-muted">As áreas aparecem da maior para a menor diferença média de percepção.</p>
        </div>
        <div className="grid gap-6">
          {report.areas.map((area, index) => <ComparisonAreaCard key={area.area} area={area} position={index + 1} />)}
        </div>
      </section>
      <ComparisonHighlights highlights={report.highlights} />
      <ComparisonGuidance />
      <section aria-labelledby="comparison-revoke-title">
        <Card className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="comparison-revoke-title" className="font-serif text-2xl font-semibold text-brand-strong">Sua autorização</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Se você revogar sua autorização, este relatório deixará de ficar disponível para ambos.
            </p>
          </div>
          <form action={revokeCoupleComparisonConsent} className="shrink-0">
            <Button type="submit" variant="secondary">Revogar autorização da comparação</Button>
          </form>
        </Card>
      </section>
    </article>
  );
}
