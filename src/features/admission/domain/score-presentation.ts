export const SCORE_PRESENTATION_MAX = 10 as const;

export const SCORE_PRESENTATION = {
  URGENT: {
    status: "PRECISA_MUDAR_COM_URGENCIA",
    title: "PRECISA MUDAR COM URGÊNCIA",
    level: "danger",
    description:
      "",
    generalDescription:
      "Há sinais importantes de dificuldade no relacionamento. Eles devem estar entre as prioridades das próximas conversas e mudanças do casal.",
  },
  IMPROVEMENT: {
    status: "PRECISA_MELHORAR",
    title: "PRECISA MELHORAR",
    level: "warning",
    description:
      "",
    generalDescription:
      "Existem pontos positivos no relacionamento, mas também dificuldades que merecem atenção, conversa e ajustes.",
  },
  GOOD: {
    status: "ESTA_BOM",
    title: "ESTÁ BOM",
    level: "success",
    description:
      "",
    generalDescription:
      "Suas respostas mostram uma percepção bastante positiva do relacionamento no momento.",
  },
} as const;

export type ScorePresentation = typeof SCORE_PRESENTATION[keyof typeof SCORE_PRESENTATION];
export type ScorePresentationStatus = ScorePresentation["status"];
export type ScorePresentationLevel = ScorePresentation["level"];

function roundToOneDecimal(value: number) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

export function convertProblemScoreToRating(score: number, maxScore: number) {
  if (!Number.isFinite(maxScore) || maxScore <= 0) return 0;
  const safeScore = Number.isFinite(score) ? Math.min(maxScore, Math.max(0, score)) : maxScore;
  const rating = SCORE_PRESENTATION_MAX * (1 - safeScore / maxScore);
  return roundToOneDecimal(Math.min(SCORE_PRESENTATION_MAX, Math.max(0, rating)));
}

export function getScorePresentation(rating: number): ScorePresentation {
  const safeRating = Number.isFinite(rating)
    ? Math.min(SCORE_PRESENTATION_MAX, Math.max(0, rating))
    : 0;
  if (safeRating < 5) return SCORE_PRESENTATION.URGENT;
  if (safeRating < 8.5) return SCORE_PRESENTATION.IMPROVEMENT;
  return SCORE_PRESENTATION.GOOD;
}

export function formatScoreRating(rating: number) {
  const safeRating = Number.isFinite(rating)
    ? Math.min(SCORE_PRESENTATION_MAX, Math.max(0, rating))
    : 0;
  return safeRating.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
