import { Alert } from "@/components/ui";
import type { AdmissionPrivateSafetyResult } from "@/types/admission-safety";

const guidance = {
  ATTENTION: {
    title: "Uma orientação privada para você",
    body: "Algumas das suas respostas indicam situações que merecem atenção em relação a segurança, respeito ou limites pessoais. Considere buscar apoio de alguém de confiança ou de um profissional qualificado se isso estiver causando desconforto ou insegurança.",
  },
  ALERT: {
    title: "Sua segurança e autonomia importam",
    body: "Algumas das suas respostas indicam uma situação importante relacionada a segurança, medo ou respeito aos seus limites. Sua segurança pessoal deve vir antes de qualquer exercício de negociação ou reconstrução do relacionamento. Procure apoio de uma pessoa de confiança ou de um serviço profissional adequado à sua região.",
  },
  HIGH_ALERT: {
    title: "Priorize sua segurança",
    body: "Uma das suas respostas indica uma situação de segurança que merece atenção prioritária. Se você se sentir em risco imediato, priorize sua segurança e procure um serviço de emergência ou apoio especializado da sua região.",
  },
} as const;

export function PrivateSafetyGuidance({ result }: { result: AdmissionPrivateSafetyResult }) {
  if (result.overallLevel === "NONE") return null;
  const content = guidance[result.overallLevel];
  return (
    <section aria-labelledby="private-safety-heading" className="mt-6">
      <Alert variant={result.overallLevel === "ATTENTION" ? "warning" : "error"}>
        <h2 id="private-safety-heading" className="font-semibold">{content.title}</h2>
        <p className="mt-2">{content.body}</p>
        <p className="mt-3 font-medium">Estas informações são privadas e não serão compartilhadas automaticamente com seu cônjuge.</p>
      </Alert>
    </section>
  );
}
