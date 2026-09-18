import { formatScoreRating } from "@/features/admission/domain/score-presentation";
import { cn } from "@/lib/cn";
import type { AdmissionIndividualReportDto } from "@/types/admission-report";
import styles from "./admission-result.module.css";

export function GeneralScoreCard({ general }: { general: AdmissionIndividualReportDto["general"] }) {
  const circumference = 2 * Math.PI * 88;
  const progress = Math.min(1, Math.max(0, general.rating / general.ratingMax));
  const statusClass = {
    danger: styles.statusDanger,
    warning: styles.statusWarning,
    success: styles.statusSuccess,
  }[general.level];

  return (
    <section aria-labelledby="general-result-heading" className={styles.gaugeSection}>
      <h2 id="general-result-heading" className="sr-only">Resultado geral do relacionamento</h2>
      <div
        className={styles.gauge}
        role="img"
        aria-label={`Pontuação geral: ${formatScoreRating(general.rating)} de ${general.ratingMax}. ${general.statusTitle}.`}
      >
        <svg className={styles.ring} viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <linearGradient id="admission-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8e99f7" />
              <stop offset="50%" stopColor="#b8a1f8" />
              <stop offset="100%" stopColor="#f8a3b0" />
            </linearGradient>
            <linearGradient id="admission-heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9ea7fb" />
              <stop offset="45%" stopColor="#baa4f9" />
              <stop offset="100%" stopColor="#fba8b4" />
            </linearGradient>
            <filter id="admission-heart-shadow" x="-25%" y="-25%" width="150%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#a89ef6" floodOpacity=".32" />
            </filter>
          </defs>
          <circle cx="100" cy="100" r="88" fill="none" stroke="#edf1f6" strokeWidth="10" />
          <circle
            className={styles.ringProgress}
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="url(#admission-ring-gradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </svg>
        <div className={styles.heartBox} aria-hidden="true">
          <svg className={styles.heart} viewBox="0 0 130 115">
            <path d="M65 106S14 72 14 38C14 18 29 6 46 6c10 0 16 6 19 12 3-6 9-12 19-12 17 0 32 12 32 32 0 34-51 68-51 68Z" fill="url(#admission-heart-gradient)" filter="url(#admission-heart-shadow)" />
          </svg>
          <div className={styles.score}>
            <span>{formatScoreRating(general.rating)}</span>
            <span className={styles.scoreMax}>/{general.ratingMax}</span>
          </div>
        </div>
      </div>
      <span className={cn(styles.statusPill, statusClass)}>{general.statusTitle}</span>
      <p className="sr-only">Quanto maior a nota, melhor a percepção registrada.</p>
    </section>
  );
}
