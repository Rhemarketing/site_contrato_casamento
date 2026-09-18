import type { AdmissionIndividualReportDto } from "@/types/admission-report";
import styles from "./admission-result.module.css";

export function AnswerDistribution({ counts }: { counts: AdmissionIndividualReportDto["answerCounts"] }) {
  const items = [
    { value: counts.satisfactory, label: "indicaram percepção satisfatória" },
    { value: counts.intermediate, label: "indicaram pontos intermediários" },
    { value: counts.relevantDifficulties, label: "indicaram dificuldades mais relevantes" },
  ];
  return (
    <section aria-labelledby="answer-distribution-heading" className={styles.section}>
      <h2 id="answer-distribution-heading" className={styles.sectionTitle}>Como as percepções se distribuíram</h2>
      <p className={styles.sectionIntro}>Das {counts.total} perguntas que compõem o diagnóstico:</p>
      <div className={styles.distribution}>
        {items.map((item) => (
          <div key={item.label} aria-label={`${item.value} respostas ${item.label}`} className={styles.distributionItem}>
            <p className={styles.distributionValue}>{item.value}</p>
            <p className={styles.distributionLabel}>respostas {item.label}</p>
          </div>
        ))}
      </div>
      <p className={styles.sectionIntro}>Esta distribuição é contextual e não apresenta as alternativas ou pontuações internas do questionário.</p>
    </section>
  );
}
