import { formatScoreRating } from "@/features/admission/domain/score-presentation";
import { cn } from "@/lib/cn";
import type { AdmissionReportAreaDto } from "@/types/admission-report";
import styles from "./admission-result.module.css";
import { AreaIcon } from "./area-icon";

export function AreaResultCard({ area }: { area: AdmissionReportAreaDto; position?: number }) {
  const formattedRating = formatScoreRating(area.rating);
  const areaClass = { danger: styles.areaDanger, warning: styles.areaWarning, success: styles.areaSuccess }[area.level];
  const scoreClass = { danger: styles.scoreDanger, warning: styles.scoreWarning, success: styles.scoreSuccess }[area.level];

  return (
    <details className={cn(styles.areaCard, areaClass)}>
      <summary className={styles.areaSummary}>
        <span className={styles.areaIdentity}>
          <span className={styles.areaIcon}><AreaIcon areaKey={area.key} /></span>
          <span className={styles.areaName}>{area.name}</span>
        </span>
        <span className={styles.areaScoreGroup}>
          <span className={cn(styles.areaScore, scoreClass)}>{formattedRating}/{area.ratingMax}</span>
          <span className={styles.chevron} aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </span>
        </span>
      </summary>
      <div className={styles.areaDetail}>
        <p className={cn(styles.areaStatus, scoreClass)}>{area.statusTitle}</p>
        <p>{area.description}</p>
        <p className={styles.areaStatusDescription}>{area.statusDescription}</p>
        <div
          className="sr-only"
          role="progressbar"
          aria-label={`${area.name}: nota ${formattedRating} de ${area.ratingMax}, classificada como ${area.statusTitle.toLowerCase()}.`}
          aria-valuemin={0}
          aria-valuemax={area.ratingMax}
          aria-valuenow={area.rating}
        >
          <div className="report-progress" />
        </div>
      </div>
    </details>
  );
}
