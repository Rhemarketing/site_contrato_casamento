import type {
  AdmissionFinancialProfile,
  AdmissionFinancialProfileDto,
  AdmissionFinancialProfileInput,
  DebtStatus,
  HousingStatus,
  IncomeBand,
  InvestmentCapacity,
  MonthlyMargin,
} from "@/types/admission-financial";
import { ADMISSION_FINANCIAL_LABELS } from "./admission-financial-content";

export const ADMISSION_FINANCIAL_QUESTION_CODES = ["P34", "P35", "P36", "P37", "P38"] as const;

const HOUSING_BY_INTERNAL_CODE = {
  MORADIA_PROPRIA_QUITADA: "OWNED_PAID",
  MORADIA_FINANCIADA: "OWNED_FINANCED",
  MORADIA_ALUGUEL_OUTRA: "RENTED_OR_OTHER",
} as const satisfies Record<string, HousingStatus>;

const INCOME_BY_INTERNAL_CODE = {
  RENDA_ATE_5000: "UP_TO_5000",
  RENDA_5001_10000: "FROM_5001_TO_10000",
  RENDA_ACIMA_10000: "ABOVE_10000",
} as const satisfies Record<string, IncomeBand>;

const MARGIN_BY_INTERNAL_CODE = {
  MARGEM_POSITIVA: "POSITIVE",
  MARGEM_APERTADA: "TIGHT",
  MARGEM_NEGATIVA: "NEGATIVE",
} as const satisfies Record<string, MonthlyMargin>;

const DEBT_BY_INTERNAL_CODE = {
  DIVIDA_CONTROLADA: "CONTROLLED",
  DIVIDA_ATENCAO: "ATTENTION",
  VULNERABILIDADE_FINANCEIRA: "FINANCIAL_VULNERABILITY",
} as const satisfies Record<string, DebtStatus>;

const INVESTMENT_BY_INTERNAL_CODE = {
  CAPACIDADE_INTEGRAL: "FULL",
  CAPACIDADE_PARCELADA: "INSTALLMENTS",
  SEM_CAPACIDADE_ATUAL: "NONE_CURRENTLY",
} as const satisfies Record<string, InvestmentCapacity>;

export class AdmissionFinancialProfileError extends Error {
  constructor(public readonly code: "FINANCIAL_PROFILE_CONFIGURATION_ERROR" | "FINANCIAL_PROFILE_FORBIDDEN") {
    super(code);
    this.name = "AdmissionFinancialProfileError";
  }
}

function mapInternalCode<TValue extends string>(internalCode: string | null, mapping: Record<string, TValue>): TValue {
  if (!internalCode || !Object.hasOwn(mapping, internalCode)) {
    throw new AdmissionFinancialProfileError("FINANCIAL_PROFILE_CONFIGURATION_ERROR");
  }
  return mapping[internalCode];
}

export function mapHousingStatus(internalCode: string | null): HousingStatus {
  return mapInternalCode(internalCode, HOUSING_BY_INTERNAL_CODE);
}

export function mapIncomeBand(internalCode: string | null): IncomeBand {
  return mapInternalCode(internalCode, INCOME_BY_INTERNAL_CODE);
}

export function mapMonthlyMargin(internalCode: string | null): MonthlyMargin {
  return mapInternalCode(internalCode, MARGIN_BY_INTERNAL_CODE);
}

export function mapDebtStatus(internalCode: string | null): DebtStatus {
  return mapInternalCode(internalCode, DEBT_BY_INTERNAL_CODE);
}

export function mapInvestmentCapacity(internalCode: string | null): InvestmentCapacity {
  return mapInternalCode(internalCode, INVESTMENT_BY_INTERNAL_CODE);
}

export function buildAdmissionFinancialProfile(inputs: AdmissionFinancialProfileInput[]): AdmissionFinancialProfile {
  if (inputs.length !== ADMISSION_FINANCIAL_QUESTION_CODES.length) {
    throw new AdmissionFinancialProfileError("FINANCIAL_PROFILE_CONFIGURATION_ERROR");
  }

  const byQuestionCode = new Map(inputs.map((input) => [input.questionCode, input]));
  if (byQuestionCode.size !== ADMISSION_FINANCIAL_QUESTION_CODES.length) {
    throw new AdmissionFinancialProfileError("FINANCIAL_PROFILE_CONFIGURATION_ERROR");
  }

  for (const input of inputs) {
    if (
      !ADMISSION_FINANCIAL_QUESTION_CODES.includes(input.questionCode as typeof ADMISSION_FINANCIAL_QUESTION_CODES[number]) ||
      input.isPrivate ||
      input.isScored ||
      input.answerScore !== null ||
      input.optionScore !== null
    ) {
      throw new AdmissionFinancialProfileError("FINANCIAL_PROFILE_CONFIGURATION_ERROR");
    }
  }

  const requireInput = (questionCode: typeof ADMISSION_FINANCIAL_QUESTION_CODES[number]) => {
    const input = byQuestionCode.get(questionCode);
    if (!input) throw new AdmissionFinancialProfileError("FINANCIAL_PROFILE_CONFIGURATION_ERROR");
    return input;
  };

  return {
    housing: mapHousingStatus(requireInput("P34").internalCode),
    incomeBand: mapIncomeBand(requireInput("P35").internalCode),
    monthlyMargin: mapMonthlyMargin(requireInput("P36").internalCode),
    debtStatus: mapDebtStatus(requireInput("P37").internalCode),
    investmentCapacity: mapInvestmentCapacity(requireInput("P38").internalCode),
  };
}

export function toAdmissionFinancialProfileDto(profile: AdmissionFinancialProfile): AdmissionFinancialProfileDto {
  return {
    housing: { code: profile.housing, label: ADMISSION_FINANCIAL_LABELS.housing[profile.housing] },
    incomeBand: { code: profile.incomeBand, label: ADMISSION_FINANCIAL_LABELS.incomeBand[profile.incomeBand] },
    monthlyMargin: { code: profile.monthlyMargin, label: ADMISSION_FINANCIAL_LABELS.monthlyMargin[profile.monthlyMargin] },
    debtStatus: { code: profile.debtStatus, label: ADMISSION_FINANCIAL_LABELS.debtStatus[profile.debtStatus] },
    investmentCapacity: {
      code: profile.investmentCapacity,
      label: ADMISSION_FINANCIAL_LABELS.investmentCapacity[profile.investmentCapacity],
    },
  };
}
