export const ADMISSION_QUESTIONNAIRE_CODE = "PROVA_ADMISSAO_CONTRATO_CASAMENTO";
export const ADMISSION_QUESTIONNAIRE_VERSION = "8.0";
export const ADMISSION_QUESTION_COUNT = 40;

export const ADMISSION_STAGE_TITLES = {
  perfil: "Conhecendo seu relacionamento",
  diagnostico: "Como está o seu casamento?",
  seguranca: "Segurança, respeito e consentimento",
  financeiro: "Realidade financeira",
  motivacao: "O relacionamento que você deseja construir",
} as const;

export function getAdmissionStageTitle(stage: string) {
  return ADMISSION_STAGE_TITLES[stage as keyof typeof ADMISSION_STAGE_TITLES] ?? "Prova de Admissão";
}
