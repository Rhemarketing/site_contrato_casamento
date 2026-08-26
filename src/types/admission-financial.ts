export type HousingStatus = "OWNED_PAID" | "OWNED_FINANCED" | "RENTED_OR_OTHER";

export type IncomeBand = "UP_TO_5000" | "FROM_5001_TO_10000" | "ABOVE_10000";

export type MonthlyMargin = "POSITIVE" | "TIGHT" | "NEGATIVE";

export type DebtStatus = "CONTROLLED" | "ATTENTION" | "FINANCIAL_VULNERABILITY";

export type InvestmentCapacity = "FULL" | "INSTALLMENTS" | "NONE_CURRENTLY";

export interface AdmissionFinancialProfile {
  housing: HousingStatus;
  incomeBand: IncomeBand;
  monthlyMargin: MonthlyMargin;
  debtStatus: DebtStatus;
  investmentCapacity: InvestmentCapacity;
}

export interface AdmissionFinancialProfileInput {
  questionCode: string;
  isPrivate: boolean;
  isScored: boolean;
  answerScore: number | null;
  optionScore: number | null;
  internalCode: string | null;
}

type FinancialProfileItem<TCode extends string> = {
  code: TCode;
  label: string;
};

export interface AdmissionFinancialProfileDto {
  housing: FinancialProfileItem<HousingStatus>;
  incomeBand: FinancialProfileItem<IncomeBand>;
  monthlyMargin: FinancialProfileItem<MonthlyMargin>;
  debtStatus: FinancialProfileItem<DebtStatus>;
  investmentCapacity: FinancialProfileItem<InvestmentCapacity>;
}
