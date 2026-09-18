import type { AdmissionIndividualReportDto } from "@/types/admission-report";
import styles from "./admission-result.module.css";

export function formatAdmissionCompletionDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));
}

export function ReportHeader({ attempt }: { attempt: AdmissionIndividualReportDto["attempt"] }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Resultado da Análise</h1>
      <div className={styles.metadata}>
        <span>{formatAdmissionCompletionDate(attempt.completedAt)}</span>
      </div>
    </header>
  );
}
