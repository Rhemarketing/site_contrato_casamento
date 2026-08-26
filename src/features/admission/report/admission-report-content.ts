import type { AdmissionAreaClassification, AdmissionGeneralClassification } from "@/types/admission-result";

export class AdmissionReportConfigurationError extends Error {
  readonly code = "REPORT_CONFIGURATION_ERROR";

  constructor() {
    super("REPORT_CONFIGURATION_ERROR");
    this.name = "AdmissionReportConfigurationError";
  }
}

export const GENERAL_REPORT_CONTENT: Record<AdmissionGeneralClassification, { title: string; summary: string; recommendation: string }> = {
  BOA_BASE_CONJUGAL: {
    title: "Boa base conjugal",
    summary: "Suas respostas indicam que existem bases positivas importantes no relacionamento. Isso não significa ausência de desafios, mas sugere que vários aspectos avaliados estão sendo percebidos de forma satisfatória neste momento.",
    recommendation: "O objetivo, nesse cenário, é preservar o que já funciona e identificar ajustes antes que pequenos desgastes se tornem problemas maiores.",
  },
  PONTOS_IMPORTANTES_DE_AJUSTE: {
    title: "Pontos importantes de ajuste",
    summary: "Suas respostas indicam uma base que ainda possui aspectos positivos, mas também alguns pontos que merecem conversa, atenção e ajustes conscientes.",
    recommendation: "Trabalhar essas diferenças enquanto ainda são administráveis pode ajudar a evitar o acúmulo de frustrações e ressentimentos.",
  },
  SINAIS_SIGNIFICATIVOS_DE_DESGASTE: {
    title: "Sinais significativos de desgaste",
    summary: "Suas respostas indicam que diferentes áreas do relacionamento já apresentam sinais relevantes de desgaste ou insatisfação.",
    recommendation: "O resultado sugere a importância de identificar com clareza quais temas estão concentrando maior dificuldade e construir conversas e acordos de maneira estruturada.",
  },
  DESCONEXAO_CONJUGAL_ELEVADA: {
    title: "Desconexão conjugal elevada",
    summary: "Suas respostas indicam dificuldades importantes em diferentes aspectos da relação e uma percepção elevada de desconexão neste momento.",
    recommendation: "Em vez de tentar resolver todos os problemas ao mesmo tempo, pode ser mais útil identificar prioridades e trabalhar os temas de maneira organizada e gradual.",
  },
  DESGASTE_CONJUGAL_MUITO_ELEVADO: {
    title: "Desgaste conjugal muito elevado",
    summary: "Suas respostas indicam um nível muito elevado de desgaste em diferentes dimensões avaliadas do relacionamento.",
    recommendation: "Esse resultado não determina o futuro da relação, mas indica que diversos temas importantes merecem atenção cuidadosa e que tentar resolver tudo apenas por discussões espontâneas pode não ser suficiente.",
  },
};

export const AREA_REPORT_CONTENT = {
  comunicacao: { name: "Comunicação", description: "Como vocês conversam, expressam necessidades e procuram compreender um ao outro." },
  conflitos_reconciliacao: { name: "Conflitos e Reconciliação", description: "Como vocês lidam com divergências, problemas recorrentes, pedidos de desculpas e reconciliação." },
  afeto_valorizacao: { name: "Carinho, Afeto e Valorização", description: "Como carinho, proximidade, reconhecimento e demonstrações de amor são percebidos na relação." },
  intimidade: { name: "Vida Sexual e Intimidade", description: "Como você percebe satisfação, desejo, frequência, conexão e liberdade para conversar sobre intimidade." },
  confianca_fidelidade_limites: { name: "Confiança, Fidelidade e Limites", description: "Como você percebe confiança, segurança relacional e acordos envolvendo terceiros e ambiente digital." },
  dinheiro_responsabilidades: { name: "Dinheiro e Responsabilidades", description: "Como vocês conversam sobre dinheiro e dividem responsabilidades da casa, filhos e família." },
  tempo_conexao_futuro: { name: "Tempo, Conexão e Futuro", description: "Como você percebe prioridade, vida de casal e perspectiva de continuidade da relação." },
  autopercepcao_disposicao: { name: "Autopercepção e Disposição", description: "Como você percebe sua própria participação nas mudanças e as possíveis diferenças de visão entre vocês." },
  habitos_compulsoes: { name: "Hábitos e Compulsões", description: "Se existem comportamentos repetitivos que possam estar trazendo desgaste para o relacionamento ou para a família." },
} as const;

export const AREA_REPORT_ORDER = Object.keys(AREA_REPORT_CONTENT) as Array<keyof typeof AREA_REPORT_CONTENT>;

export const AREA_CLASSIFICATION_CONTENT: Record<AdmissionAreaClassification, { title: string; summary: string }> = {
  PONTO_FORTE: { title: "Ponto forte", summary: "Suas respostas indicam que esta área está sendo percebida de forma relativamente positiva neste momento." },
  PONTO_DE_ATENCAO: { title: "Ponto de atenção", summary: "Esta área apresenta alguns sinais de diferença, insatisfação ou dificuldade que merecem atenção." },
  AREA_PRIORITARIA: { title: "Área prioritária", summary: "Suas respostas indicam que esta área concentra dificuldades mais importantes e merece prioridade nas próximas conversas e decisões." },
};

export const PRIORITY_FLAG_CONTENT = {
  CONVERSA_INTIMIDADE_PRIORITARIA: {
    title: "Conversa sobre intimidade merece atenção",
    description: "Sua resposta indica dificuldade importante para conversar abertamente sobre desejos, limites, preferências ou insatisfações relacionadas à intimidade.",
    recommendation: "Esse tema pode merecer uma conversa especialmente cuidadosa e respeitosa.",
  },
  FERIDA_CONFIANCA_PRIORITARIA: {
    title: "Existe uma ferida importante de confiança",
    description: "Sua resposta indica que existe uma situação do passado ou do presente que continua afetando de maneira importante sua confiança no relacionamento.",
    recommendation: null,
  },
  INSATISFACAO_FUTURO_PRIORITARIA: {
    title: "A perspectiva de continuar assim merece atenção",
    description: "Sua resposta indica que você não gostaria de continuar vivendo o relacionamento da mesma maneira pelos próximos cinco anos.",
    recommendation: "Esse sinal merece ser considerado com seriedade ao definir quais mudanças são realmente importantes para você.",
  },
  HABITO_COMPULSIVO_PRIORITARIO: {
    title: "Um comportamento recorrente está trazendo impacto importante",
    description: "Sua resposta indica que existe um hábito, vício ou comportamento recorrente prejudicando significativamente o relacionamento, a família ou as finanças.",
    recommendation: null,
  },
} as const;

export function getGeneralReportContent(classification: string) {
  const content = GENERAL_REPORT_CONTENT[classification as AdmissionGeneralClassification];
  if (!content) throw new AdmissionReportConfigurationError();
  return content;
}

export function getAreaReportContent(area: string) {
  const content = AREA_REPORT_CONTENT[area as keyof typeof AREA_REPORT_CONTENT];
  if (!content) throw new AdmissionReportConfigurationError();
  return content;
}

export function getAreaClassificationContent(classification: string) {
  const content = AREA_CLASSIFICATION_CONTENT[classification as AdmissionAreaClassification];
  if (!content) throw new AdmissionReportConfigurationError();
  return content;
}

export function getPriorityFlagContent(code: string) {
  const content = PRIORITY_FLAG_CONTENT[code as keyof typeof PRIORITY_FLAG_CONTENT];
  if (!content) throw new AdmissionReportConfigurationError();
  return content;
}
