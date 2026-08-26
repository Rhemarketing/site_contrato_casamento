export const ADMISSION_GENERAL_CLASSIFICATIONS = {
  GOOD_BASE: "BOA_BASE_CONJUGAL",
  IMPORTANT_ADJUSTMENTS: "PONTOS_IMPORTANTES_DE_AJUSTE",
  SIGNIFICANT_WEAR: "SINAIS_SIGNIFICATIVOS_DE_DESGASTE",
  HIGH_DISCONNECTION: "DESCONEXAO_CONJUGAL_ELEVADA",
  VERY_HIGH_WEAR: "DESGASTE_CONJUGAL_MUITO_ELEVADO",
} as const;

export const ADMISSION_AREA_CLASSIFICATIONS = {
  STRENGTH: "PONTO_FORTE",
  ATTENTION: "PONTO_DE_ATENCAO",
  PRIORITY: "AREA_PRIORITARIA",
} as const;

export const ADMISSION_FLAG_SEVERITY = "PRIORITY" as const;

export const ADMISSION_SCORE_AREAS = [
  { key: "comunicacao", questionCodes: ["P06", "P07", "P08"], maxScore: 6 },
  { key: "conflitos_reconciliacao", questionCodes: ["P09", "P10", "P11"], maxScore: 6 },
  { key: "afeto_valorizacao", questionCodes: ["P12", "P13", "P14"], maxScore: 6 },
  { key: "intimidade", questionCodes: ["P15", "P16", "P17", "P18"], maxScore: 8 },
  { key: "confianca_fidelidade_limites", questionCodes: ["P19", "P20", "P21"], maxScore: 6 },
  { key: "dinheiro_responsabilidades", questionCodes: ["P22", "P23", "P24"], maxScore: 6 },
  { key: "tempo_conexao_futuro", questionCodes: ["P25", "P26", "P27"], maxScore: 6 },
  { key: "autopercepcao_disposicao", questionCodes: ["P28", "P29"], maxScore: 4 },
  { key: "habitos_compulsoes", questionCodes: ["P30"], maxScore: 2 },
] as const;

export const ADMISSION_PRIORITY_FLAGS = {
  P18: "CONVERSA_INTIMIDADE_PRIORITARIA",
  P21: "FERIDA_CONFIANCA_PRIORITARIA",
  P27: "INSATISFACAO_FUTURO_PRIORITARIA",
  P30: "HABITO_COMPULSIVO_PRIORITARIO",
} as const;

export const ADMISSION_SCORED_QUESTION_CODES = ADMISSION_SCORE_AREAS.flatMap((area) => [...area.questionCodes]);
export const ADMISSION_MAX_SCORE = 50 as const;
