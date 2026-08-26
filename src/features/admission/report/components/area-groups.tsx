import type { AdmissionIndividualReportDto, AdmissionReportAreaDto } from "@/types/admission-report";
import { AreaResultCard } from "./area-result-card";

const groups: Array<{ key: keyof AdmissionIndividualReportDto["areaGroups"]; title: string; description: string }> = [
  { key: "strengths", title: "Pontos fortes", description: "Aspectos percebidos de forma relativamente positiva neste momento." },
  { key: "attention", title: "Pontos que merecem atenção", description: "Temas com sinais intermediários de diferença, insatisfação ou dificuldade." },
  { key: "priorities", title: "Áreas prioritárias", description: "Temas que concentram maior necessidade de atenção nas próximas conversas e decisões." },
];

function AreaGroup({ title, description, areas }: { title: string; description: string; areas: AdmissionReportAreaDto[] }) {
  return (
    <section aria-labelledby={`area-group-${title.replaceAll(" ", "-").toLowerCase()}`} className="mt-12">
      <h2 id={`area-group-${title.replaceAll(" ", "-").toLowerCase()}`} className="font-serif text-3xl text-brand-strong">{title}</h2>
      <p className="mt-2 max-w-3xl text-muted">{description}</p>
      {areas.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {areas.map((area) => <AreaResultCard key={area.key} area={area} />)}
        </div>
      ) : <p className="mt-5 rounded-xl border border-line bg-surface p-5 text-sm text-muted">Nenhuma área foi classificada neste grupo.</p>}
    </section>
  );
}

export function AreaGroups({ areaGroups }: { areaGroups: AdmissionIndividualReportDto["areaGroups"] }) {
  return <>{groups.map((group) => <AreaGroup key={group.key} title={group.title} description={group.description} areas={areaGroups[group.key]} />)}</>;
}
