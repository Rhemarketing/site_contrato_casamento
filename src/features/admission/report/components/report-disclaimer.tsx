import Link from "next/link";
import styles from "./admission-result.module.css";

export function ReportDisclaimer() {
  return (
    <footer className={styles.disclaimer}>
      <h2>Um retrato deste momento</h2>
      <p>Este relatório representa a percepção informada por você no momento da avaliação. Ele não determina o futuro da relação e pode mudar conforme experiências, conversas e decisões futuras.</p>
      <p>Uma etapa futura poderá incluir a participação do seu cônjuge para identificar convergências e diferenças de percepção. Essa participação ainda não está disponível nesta etapa.</p>
      <Link href="/dashboard" className={styles.dashboardLink}>Voltar ao dashboard</Link>
    </footer>
  );
}
