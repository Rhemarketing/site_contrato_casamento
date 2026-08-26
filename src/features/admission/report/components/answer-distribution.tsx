import { Card } from "@/components/ui";
import type { AdmissionIndividualReportDto } from "@/types/admission-report";

export function AnswerDistribution({ counts }: { counts: AdmissionIndividualReportDto["answerCounts"] }) {
  const items = [
    { value: counts.satisfactory, label: "indicaram percepção satisfatória" },
    { value: counts.intermediate, label: "indicaram pontos intermediários" },
    { value: counts.relevantDifficulties, label: "indicaram dificuldades mais relevantes" },
  ];
  return (
    <section aria-labelledby="answer-distribution-heading" className="mt-12">
      <h2 id="answer-distribution-heading" className="font-serif text-3xl text-brand-strong">Como as percepções se distribuíram</h2>
      <p className="mt-2 text-muted">Das {counts.total} perguntas que compõem o diagnóstico:</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {items.map((item) => <Card key={item.label} aria-label={`${item.value} respostas ${item.label}`} className="p-5"><p className="font-serif text-4xl text-brand-strong">{item.value}</p><p className="mt-2 text-sm text-muted">respostas {item.label}</p></Card>)}
      </div>
      <p className="mt-3 text-sm text-muted">Esta distribuição é contextual e não apresenta as alternativas ou pontuações internas do questionário.</p>
    </section>
  );
}
