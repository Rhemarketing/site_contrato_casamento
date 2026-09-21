import type { SVGProps } from "react";

const commonProps: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function AreaIcon({ areaKey }: { areaKey: string }) {
  switch (areaKey) {
    case "comunicacao":
      return <svg {...commonProps}><path d="M7.5 19.5 3 21l1.5-4.5A8.8 8.8 0 0 1 3 12a9 9 0 1 1 9 9 9 9 0 0 1-4.5-1.5Z" /><path d="M8 9.5h8M8 12.5h8M8 15.5h5" /></svg>;
    case "conflitos_reconciliacao":
      return <svg {...commonProps}><path d="m5 19 7-7M8 12h4v4M14 5V2M19 6l2.5-2.5M20 11h3M19 16l2.5 2.5" /></svg>;
    case "afeto_valorizacao":
      return <svg {...commonProps}><path d="m19.5 12.6-7.5 7.4-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6Z" /><path d="m12 6-2 4 3 3-2 4 1 3" /></svg>;
    case "intimidade":
      return <svg {...commonProps}><circle cx="8" cy="15" r="4" /><circle cx="12.5" cy="11" r="4" /><circle cx="16" cy="15" r="4" /></svg>;
    case "confianca_fidelidade_limites":
      return <svg {...commonProps}><path d="M12 3.5c2.5 0 4.5.8 4.5.8V8c0 3-2 5.5-4.5 6.5C9.5 13.5 7.5 11 7.5 8V4.3s2-.8 4.5-.8Z" /><path d="m10.5 8 1.2 1.3L14 7" /><path d="M3 18c2.5-1 5.5-.5 7.5 1.2l3 2.3c1 .8 2.5.5 3-.5l1-1.8a2 2 0 0 0-.5-2.6l-2.5-1.8H9" /></svg>;
    case "dinheiro_casal":
    case "dinheiro_responsabilidades":
      return <svg {...commonProps}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="6.5" /><path d="M12 7.5v9M14 9.5A1.8 1.8 0 0 0 12.2 8h-.4A1.8 1.8 0 0 0 10 9.8c0 1.2 1 1.7 2 2.1s2 1 2 2.1a1.8 1.8 0 0 1-1.8 1.8h-.4a1.8 1.8 0 0 1-1.8-1.5" /></svg>;
    case "casa_filhos_responsabilidades":
      return <svg {...commonProps}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M9 22V12h6v10" /></svg>;
    case "tempo_conexao_futuro":
      return <svg {...commonProps}><rect x="3" y="4" width="18" height="15" rx="2.5" /><path d="M8 2v3M16 2v3M3 8.5h18" /><circle cx="16" cy="15" r="4" fill="white" /><path d="m14.5 15 1.2 1.2 2-2" /></svg>;
    case "autopercepcao_disposicao":
      return <svg {...commonProps}><rect x="2" y="7" width="18" height="11" rx="3" /><path d="M22 11v3" /><rect x="4.5" y="9.5" width="10" height="6" rx="1.5" fill="currentColor" stroke="none" /></svg>;
    case "habitos_compulsoes":
      return <svg {...commonProps}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="m9 14 2 2 4-4" /></svg>;
    default:
      return <svg {...commonProps}><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3C14.7 3 13.5 3.5 12 5 10.5 3.5 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5C2 10.8 3.5 12.6 5 14l7 7Z" /></svg>;
  }
}
