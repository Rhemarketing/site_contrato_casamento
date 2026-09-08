import type { AdmissionIndividualReportDto, AdmissionReportAreaDto } from "@/types/admission-report";
import { cn } from "@/lib/cn";
import { AreaResultCard } from "./area-result-card";
import { scoreLevelStyles } from "./score-status-badge";

const groups: Array<{ key: keyof AdmissionIndividualReportDto["areaGroups"]; title: string; description: string; level: AdmissionReportAreaDto["level"] }> = [
  { key: "urgent", title: "Precisa mudar com urgência", description: "Áreas que pedem prioridade, cuidado e mudanças mais imediatas.", level: "danger" },
  { key: "improvement", title: "Precisa melhorar", description: "Áreas com pontos positivos, mas que ainda merecem conversa e ajustes.", level: "warning" },
  { key: "good", title: "Está bom", description: "Áreas percebidas de forma positiva e que vale a pena continuar cultivando.", level: "success" },
];

function AreaGroup({ title, description, areas, level }: { title: string; description: string; areas: AdmissionReportAreaDto[]; level: AdmissionReportAreaDto["level"] }) {
  const styles = scoreLevelStyles[level];
  const headingId = `area-group-${level}`;
  return (
    <section aria-labelledby={headingId} className="report-reveal mt-14">
      <div className="flex items-start gap-4">
        <span className={cn("mt-1.5 size-3 shrink-0 rounded-full shadow-[0_0_0_6px] shadow-white", styles.bar)} aria-hidden="true" />
        <div>
          <h2 id={headingId} className={cn("font-serif text-3xl sm:text-4xl", styles.text)}>{title}</h2>
          <p className={cn("mt-1 max-w-3xl", styles.mutedText)}>{description}</p>
        </div>
      </div>
      {areas.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {areas.map((area, index) => <AreaResultCard key={area.key} area={area} position={index + 1} />)}
        </div>
      ) : <p className={cn("mt-5 rounded-2xl border p-5 text-sm", styles.soft, styles.mutedText)}>Nenhuma área foi classificada neste grupo.</p>}
    </section>
  );
}

export function AreaGroups({ areaGroups }: { areaGroups: AdmissionIndividualReportDto["areaGroups"] }) {
  return <>{groups.map((group) => <AreaGroup key={group.key} title={group.title} description={group.description} level={group.level} areas={areaGroups[group.key]} />)}</>;
}
