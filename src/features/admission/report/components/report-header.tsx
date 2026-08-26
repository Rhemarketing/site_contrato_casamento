import { Badge } from "@/components/ui";
import type { AdmissionIndividualReportDto } from "@/types/admission-report";

export function formatAdmissionCompletionDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));
}

export function ReportHeader({ attempt }: { attempt: AdmissionIndividualReportDto["attempt"] }) {
  return (
    <header>
      <Badge>Relatório individual</Badge>
      <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-tight text-brand-strong sm:text-5xl lg:text-6xl">Resultado da sua Prova de Admissão</h1>
      <p className="mt-5 max-w-3xl text-lg text-muted">Este relatório apresenta um retrato das percepções que você informou sobre o relacionamento neste momento.</p>
      <p className="mt-2 max-w-3xl text-sm text-muted">Ele não substitui avaliação médica, psicológica, jurídica ou profissional especializada.</p>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        <span>Avaliação concluída em {formatAdmissionCompletionDate(attempt.completedAt)}</span>
        <span>Prova de Admissão — versão {attempt.questionnaireVersion}</span>
      </div>
    </header>
  );
}
