import { Card } from "@/components/ui/card";
import type { CoupleComparisonReportAreaDto } from "@/types/couple-comparison-report";
import { ComparisonQuestionItem } from "./comparison-question-item";

export function ComparisonAreaCard({ area, position }: { area: CoupleComparisonReportAreaDto; position: number }) {
  return (
    <article aria-labelledby={`comparison-area-${area.area}`}>
      <Card className="p-0">
        <div className="p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Área {position}</p>
              <h3 id={`comparison-area-${area.area}`} className="mt-2 font-serif text-2xl font-semibold text-brand-strong">
                {area.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{area.description}</p>
            </div>
            <div className="w-fit shrink-0 rounded-2xl bg-accent-soft px-4 py-3 sm:text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-brand">Diferença média</p>
              <p className="font-serif text-2xl font-semibold text-brand-strong">
                {area.averageDifference.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <p className="mt-5 rounded-2xl border border-line bg-background px-4 py-3 text-sm leading-relaxed text-foreground">
            {area.narrative}
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div><dt className="text-muted">Perguntas</dt><dd className="text-lg font-semibold text-brand-strong">{area.questionCount}</dd></div>
            <div><dt className="text-muted">Semelhantes</dt><dd className="text-lg font-semibold text-emerald-800">{area.convergenceCount}</dd></div>
            <div><dt className="text-muted">Diferenças</dt><dd className="text-lg font-semibold text-amber-800">{area.moderateDivergenceCount}</dd></div>
            <div><dt className="text-muted">Importantes</dt><dd className="text-lg font-semibold text-rose-800">{area.importantDivergenceCount}</dd></div>
          </dl>
        </div>
        <details className="group border-t border-line">
          <summary className="cursor-pointer list-none px-6 py-4 font-semibold text-brand transition hover:bg-brand/5 focus-visible:outline-offset-[-3px] sm:px-7">
            <span className="flex items-center justify-between gap-3">
              Ver as {area.questionCount} perguntas desta área
              <span className="shrink-0 text-xl transition group-open:rotate-45" aria-hidden="true">+</span>
            </span>
          </summary>
          <ol className="border-t border-line px-6 py-5 sm:px-7">
            {area.questions.map((question) => <ComparisonQuestionItem key={question.questionCode} question={question} />)}
          </ol>
        </details>
      </Card>
    </article>
  );
}
