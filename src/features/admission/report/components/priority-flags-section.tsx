import type { AdmissionIndividualReportDto } from "@/types/admission-report";
import styles from "./admission-result.module.css";

export function PriorityFlagsSection({ flags }: { flags: AdmissionIndividualReportDto["flags"] }) {
  return (
    <section aria-labelledby="priority-themes-heading" className={styles.section}>
      <h2 id="priority-themes-heading" className={styles.sectionTitle}>Temas específicos sinalizados</h2>
      <p className={styles.sectionIntro}>Algumas respostas podem destacar temas conjugais que merecem consideração cuidadosa, além da leitura geral das áreas.</p>
      {flags.length ? (
        <div className={styles.flagList}>
          {flags.map((flag) => (
            <div key={flag.code} className={styles.flag}>
              <h3 className={styles.flagTitle}>{flag.title}</h3>
              <p className={styles.flagText}>{flag.description}</p>
              {flag.recommendation ? <p className={styles.flagText}>{flag.recommendation}</p> : null}
            </div>
          ))}
        </div>
      ) : <p className={styles.sectionIntro}>Nenhum tema específico foi sinalizado pelas respostas diagnósticas.</p>}
    </section>
  );
}
