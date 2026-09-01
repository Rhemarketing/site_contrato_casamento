import { Badge } from "@/components/ui";
import type { AdmissionIndividualReportDto } from "@/types/admission-report";

export function formatAdmissionCompletionDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));
}

export function ReportHeader({ attempt }: { attempt: AdmissionIndividualReportDto["attempt"] }) {
  return (
    <header>
      <Badge>Relatório individual</Badge>
      <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-tight text-brand-strong sm:text-5xl lg:text-6xl">Resultado da sua Avaliação Básica:</h1>
    </header>
  );
}
