import { admissionQuestionnaireV8 } from "@/data/questionnaire-admission-v8";
import { ADMISSION_COMPARISON_QUESTION_CODES } from "@/features/admission/security/private-answer-policy";
import type { CoupleComparisonClassification } from "@/types/couple-comparison";

export class CoupleComparisonReportConfigurationError extends Error {
  constructor() {
    super("COUPLE_COMPARISON_REPORT_CONFIGURATION_ERROR");
    this.name = "CoupleComparisonReportConfigurationError";
  }
}

export const COUPLE_COMPARISON_AREA_CONTENT = {
  comunicacao: {
    name: "Comunicação",
    description: "Como vocês conversam, expressam necessidades e procuram compreender um ao outro.",
  },
  conflitos_reconciliacao: {
    name: "Conflitos e Reconciliação",
    description: "Como vocês lidam com divergências, problemas recorrentes, pedidos de desculpas e reconciliação.",
  },
  afeto_valorizacao: {
    name: "Carinho, Afeto e Valorização",
    description: "Como carinho, proximidade, reconhecimento e demonstrações de amor são percebidos na relação.",
  },
  intimidade: {
    name: "Vida Sexual e Intimidade",
    description: "Como vocês percebem satisfação, desejo, frequência, conexão e conversa sobre intimidade.",
  },
  confianca_fidelidade_limites: {
    name: "Confiança, Fidelidade e Limites",
    description: "Como vocês percebem confiança, segurança relacional e acordos envolvendo terceiros e ambiente digital.",
  },
  dinheiro_responsabilidades: {
    name: "Dinheiro e Responsabilidades",
    description: "Como vocês conversam sobre dinheiro e dividem responsabilidades da casa, dos filhos e da família.",
  },
  tempo_conexao_futuro: {
    name: "Tempo, Conexão e Futuro",
    description: "Como vocês percebem prioridade, vida de casal e perspectiva de continuidade da relação.",
  },
  autopercepcao_disposicao: {
    name: "Autopercepção e Disposição",
    description: "Como cada pessoa percebe sua participação nas mudanças e as possíveis diferenças de visão entre vocês.",
  },
  habitos_compulsoes: {
    name: "Hábitos e Compulsões",
    description: "Como comportamentos repetitivos e seus possíveis impactos são percebidos no relacionamento.",
  },
} as const;

export const COUPLE_COMPARISON_CLASSIFICATION_CONTENT: Record<
  CoupleComparisonClassification,
  { label: string }
> = {
  CONVERGENCIA: { label: "Percepções semelhantes" },
  DIVERGENCIA_MODERADA: { label: "Diferença de percepção" },
  DIVERGENCIA_IMPORTANTE: { label: "Diferença importante de percepção" },
};

export const COUPLE_COMPARISON_GUIDANCE = [
  "Comecem pelas áreas em que existe maior alinhamento.",
  "Escolham uma diferença de percepção por vez.",
  "Procurem entender como o outro enxerga a situação antes de tentar responder ou corrigir.",
  "Evitem usar o relatório como prova de quem está certo.",
  "Transformem diferenças em temas para conversa e construção de acordos.",
] as const;

const comparisonQuestionText = new Map(
  admissionQuestionnaireV8.perguntas
    .filter(({ codigo }) => ADMISSION_COMPARISON_QUESTION_CODES.includes(codigo))
    .map(({ codigo, pergunta }) => [codigo, pergunta] as const),
);

export function getCoupleComparisonAreaContent(area: string) {
  const content = COUPLE_COMPARISON_AREA_CONTENT[area as keyof typeof COUPLE_COMPARISON_AREA_CONTENT];
  if (!content) throw new CoupleComparisonReportConfigurationError();
  return content;
}

export function getCoupleComparisonQuestionText(questionCode: string) {
  const text = comparisonQuestionText.get(questionCode);
  if (!text) throw new CoupleComparisonReportConfigurationError();
  return text;
}

export function getCoupleComparisonClassificationLabel(classification: CoupleComparisonClassification) {
  return COUPLE_COMPARISON_CLASSIFICATION_CONTENT[classification].label;
}

export function getCoupleComparisonAreaNarrative(counts: {
  moderateDivergenceCount: number;
  importantDivergenceCount: number;
}) {
  if (counts.importantDivergenceCount > 0) {
    return "Esta área concentra diferenças importantes de percepção e pode merecer uma conversa mais cuidadosa.";
  }
  if (counts.moderateDivergenceCount > 0) {
    return "Existem algumas diferenças de percepção nesta área.";
  }
  return "Vocês percebem esta área de maneira bastante semelhante.";
}
