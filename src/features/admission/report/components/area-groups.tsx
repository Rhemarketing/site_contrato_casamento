import type { AdmissionIndividualReportDto, AdmissionReportAreaDto } from "@/types/admission-report";
import styles from "./admission-result.module.css";
import { AreaResultCard } from "./area-result-card";

const groups: Array<{ key: keyof AdmissionIndividualReportDto["areaGroups"]; title: string; level: AdmissionReportAreaDto["level"] }> = [
  { key: "urgent", title: "Situação crítica", level: "danger" },
  { key: "improvement", title: "Pode melhorar", level: "warning" },
  { key: "good", title: "Está ótimo", level: "success" },
];

function AreaGroup({ title, areas, level }: { title: string; areas: AdmissionReportAreaDto[]; level: AdmissionReportAreaDto["level"] }) {
  const headingId = `area-group-${level}`;
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.groupHeading}>{title}</h2>
      {areas.length ? (
        <div className={styles.cards}>
          {areas.map((area, index) => <AreaResultCard key={area.key} area={area} position={index + 1} />)}
        </div>
      ) : <p className={styles.empty}>Nenhuma área nesta categoria</p>}
    </section>
  );
}

export function AreaGroups({ areaGroups }: { areaGroups: AdmissionIndividualReportDto["areaGroups"] }) {
  return <div className={styles.groups}>{groups.map((group) => <AreaGroup key={group.key} title={group.title} level={group.level} areas={areaGroups[group.key]} />)}</div>;
}
