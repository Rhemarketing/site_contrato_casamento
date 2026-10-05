import Link from "next/link";
import styles from "./admission-result.module.css";

export function ContractCtaButton() {
  return (
    <div className={styles.cardCtaContainer}>
      <Link href="/contrato/comprar" className={styles.premiumCtaButton}>
        <svg
          className={styles.premiumCtaIcon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 21l1.912-5.813a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
        <span>Adquirir Contrato de Casamento</span>
      </Link>
    </div>
  );
}
