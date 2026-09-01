import { Card } from "@/components/ui";
import type { AdmissionIndividualReportDto } from "@/types/admission-report";

export function PriorityFlagsSection({ flags }: { flags: AdmissionIndividualReportDto["flags"] }) {
  return (
    <section aria-labelledby="priority-themes-heading" className="mt-12">
      <h2 id="priority-themes-heading" className="font-serif text-3xl text-brand-strong">Temas específicos sinalizados</h2>
      <p className="mt-2 max-w-3xl text-muted">Algumas respostas podem destacar temas conjugais que merecem consideração cuidadosa, além da leitura geral das áreas.</p>
      {flags.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {flags.map((flag) => (
            <Card key={flag.code} className="border-accent/30 p-5 sm:p-6">
              <h3 className="text-xl font-semibold text-brand-strong">{flag.title}</h3>
              <p className="mt-3 text-sm text-muted">{flag.description}</p>
              {flag.recommendation ? <p className="mt-3 text-sm text-muted">{flag.recommendation}</p> : null}
            </Card>
          ))}
        </div>
      ) : <p className="mt-5 rounded-xl border border-line bg-surface p-5 text-sm text-muted">Nenhum tema específico foi sinalizado pelas respostas diagnósticas.</p>}
    </section>
  );
}
