import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CoupleComparisonReportDto } from "@/types/couple-comparison-report";

export function ComparisonSummary({ report }: { report: CoupleComparisonReportDto }) {
  const items = [
    { label: "Perguntas comparadas", value: report.totalQuestions, accent: "text-brand-strong" },
    { label: "Percepções semelhantes", value: report.summary.convergenceCount, accent: "text-emerald-800" },
    { label: "Diferenças de percepção", value: report.summary.moderateDivergenceCount, accent: "text-amber-800" },
    { label: "Diferenças importantes de percepção", value: report.summary.importantDivergenceCount, accent: "text-rose-800" },
  ];

  return (
    <section aria-labelledby="comparison-summary-title">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-line bg-[linear-gradient(135deg,rgba(36,75,90,0.08),rgba(200,111,93,0.08))] p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Badge>Relatório compartilhado</Badge>
              <h2 id="comparison-summary-title" className="mt-4 font-serif text-2xl font-semibold text-brand-strong sm:text-3xl">
                Visão geral das percepções
              </h2>
              <p className="mt-2 max-w-2xl text-muted">
                Os números abaixo resumem somente as diferenças encontradas entre P06 e P30.
              </p>
            </div>
            <p className="text-sm font-semibold text-muted">Prova de Admissão — versão {report.questionnaireVersion}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="bg-surface p-5 sm:p-6">
              <dt className="text-sm leading-snug text-muted">{item.label}</dt>
              <dd className={`mt-1 font-serif text-3xl font-semibold ${item.accent}`}>{item.value}</dd>
            </div>
          ))}
        </div>
      </Card>
      <Alert className="mt-5">
        O objetivo não é determinar quem está certo ou errado, mas identificar diferenças de percepção.
      </Alert>
    </section>
  );
}
