import Link from "next/link";
import { Card } from "@/components/ui";

export function ReportDisclaimer() {
  return (
    <footer className="mt-12">
      <Card className="p-6 sm:p-8">
        <h2 className="font-serif text-2xl text-brand-strong">Um retrato deste momento</h2>
        <p className="mt-3 text-muted">Este relatório representa a percepção informada por você no momento da avaliação. Ele não determina o futuro da relação e pode mudar conforme experiências, conversas e decisões futuras.</p>
        <p className="mt-3 text-muted">derá incluir a participação do seu cônjuge para identificar convergências e diferenças de percepção. Essa participação ainda não está disponível nesta etapa.</p>
        <Link href="/dashboard" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-brand px-6 font-semibold text-white hover:bg-brand-strong">Voltar ao dashboard</Link>
      </Card>

    </footer>
  );
}
