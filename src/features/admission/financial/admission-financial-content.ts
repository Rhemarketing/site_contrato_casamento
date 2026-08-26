import type {
  DebtStatus,
  HousingStatus,
  IncomeBand,
  InvestmentCapacity,
  MonthlyMargin,
} from "@/types/admission-financial";

export const ADMISSION_FINANCIAL_LABELS = {
  housing: {
    OWNED_PAID: "Imóvel próprio quitado",
    OWNED_FINANCED: "Imóvel próprio financiado",
    RENTED_OR_OTHER: "Aluguel, imóvel cedido ou outra situação",
  } satisfies Record<HousingStatus, string>,
  incomeBand: {
    UP_TO_5000: "Até R$ 5.000 por mês",
    FROM_5001_TO_10000: "De R$ 5.001 a R$ 10.000 por mês",
    ABOVE_10000: "Acima de R$ 10.000 por mês",
  } satisfies Record<IncomeBand, string>,
  monthlyMargin: {
    POSITIVE: "Normalmente existe alguma margem financeira",
    TIGHT: "Orçamento mensal bastante ajustado",
    NEGATIVE: "Há dificuldade recorrente para fechar o mês",
  } satisfies Record<MonthlyMargin, string>,
  debtStatus: {
    CONTROLLED: "Compromissos financeiros controlados",
    ATTENTION: "Compromissos que exigem atenção",
    FINANCIAL_VULNERABILITY: "Dificuldades financeiras com impacto relevante",
  } satisfies Record<DebtStatus, string>,
  investmentCapacity: {
    FULL: "Há capacidade atual sem comprometer despesas essenciais",
    INSTALLMENTS: "Há capacidade principalmente com parcelamento ou opção mais acessível",
    NONE_CURRENTLY: "Não há capacidade atual para assumir novo compromisso financeiro",
  } satisfies Record<InvestmentCapacity, string>,
} as const;
