import Link from "next/link";
import { PrivateSafetyGuidance } from "@/features/admission/components/private-safety-guidance";
import type { AdmissionIndividualReportDto } from "@/types/admission-report";
import { AreaGroups } from "./area-groups";
import { GeneralScoreCard } from "./general-score-card";
import { ReportHeader } from "./report-header";
import styles from "./admission-result.module.css";

export function IndividualAdmissionReport({ report }: { report: AdmissionIndividualReportDto }) {
  return (
    <article className={styles.report}>
      <div className={styles.content}>
        <ReportHeader attempt={report.attempt} />
        <GeneralScoreCard general={report.general} />
        <AreaGroups areaGroups={report.areaGroups} />
        <p className={styles.hint}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
          Toque em qualquer área para ver a análise detalhada.
        </p>
        {report.safety ? <PrivateSafetyGuidance result={report.safety} /> : null}
        <div className="mt-8 flex justify-center">
          <Link href="/dashboard" className={styles.dashboardLink}>Voltar ao dashboard</Link>
        </div>
      </div>
    </article>
  );
}
