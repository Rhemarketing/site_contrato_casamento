export type CoupleErrorCode =
  | "COUPLE_ALREADY_ACTIVE"
  | "COUPLE_NOT_FOUND"
  | "COUPLE_NOT_PENDING"
  | "COUPLE_CONFIGURATION_ERROR"
  | "INVITE_NOT_FOUND"
  | "INVITE_EXPIRED"
  | "INVITE_ALREADY_USED"
  | "INVITE_CANCELLED"
  | "INVITE_EMAIL_MISMATCH"
  | "SELF_INVITE_NOT_ALLOWED"
  | "USER_ALREADY_COUPLED"
  | "INVITE_FORBIDDEN"
  | "INVITE_OPERATION_CONFLICT";

export const COUPLE_ERROR_MESSAGES: Record<CoupleErrorCode, string> = {
  COUPLE_ALREADY_ACTIVE: "Você já possui um relacionamento conectado.",
  COUPLE_NOT_FOUND: "Nenhum vínculo atual foi encontrado.",
  COUPLE_NOT_PENDING: "Este vínculo não pode ser cancelado por este fluxo.",
  COUPLE_CONFIGURATION_ERROR: "Não foi possível carregar o vínculo com segurança.",
  INVITE_NOT_FOUND: "Este convite não está disponível.",
  INVITE_EXPIRED: "Este convite expirou.",
  INVITE_ALREADY_USED: "Este convite já foi utilizado.",
  INVITE_CANCELLED: "Este convite não está mais disponível.",
  INVITE_EMAIL_MISMATCH: "Este convite foi destinado a outra conta. Entre com o e-mail que recebeu o convite.",
  SELF_INVITE_NOT_ALLOWED: "Use o e-mail do seu cônjuge para criar o convite.",
  USER_ALREADY_COUPLED: "Esta conta já possui um vínculo atual.",
  INVITE_FORBIDDEN: "Não foi possível aceitar este convite com esta conta.",
  INVITE_OPERATION_CONFLICT: "A operação encontrou outra alteração simultânea. Tente novamente.",
};

export class CoupleDomainError extends Error {
  constructor(public readonly code: CoupleErrorCode) {
    super(code);
    this.name = "CoupleDomainError";
  }
}
