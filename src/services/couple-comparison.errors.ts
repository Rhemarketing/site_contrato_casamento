export type CoupleComparisonErrorCode =
  | "COMPARISON_COUPLE_NOT_ACTIVE"
  | "COMPARISON_ADMISSION_NOT_COMPLETED"
  | "COMPARISON_CONFIGURATION_ERROR";

export const COUPLE_COMPARISON_ERROR_MESSAGES: Record<CoupleComparisonErrorCode, string> = {
  COMPARISON_COUPLE_NOT_ACTIVE: "A autorização exige um relacionamento conectado e ativo.",
  COMPARISON_ADMISSION_NOT_COMPLETED: "Conclua a Prova de Admissão antes de autorizar a comparação.",
  COMPARISON_CONFIGURATION_ERROR: "Não foi possível carregar a comparação com segurança.",
};

export class CoupleComparisonDomainError extends Error {
  constructor(public readonly code: CoupleComparisonErrorCode) {
    super(code);
    this.name = "CoupleComparisonDomainError";
  }
}
