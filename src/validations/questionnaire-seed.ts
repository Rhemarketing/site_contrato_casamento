import { z } from "zod";

const optionSchema = z.object({
  letra: z.enum(["A", "B", "C"]),
  texto: z.string().trim().min(1),
  pontuacao: z.number().int().min(0).max(2).nullable(),
  codigo_interno: z.string().trim().min(1).optional(),
  flag: z.string().trim().min(1).optional(),
}).strict();

const questionSchema = z.object({
  id: z.number().int().min(1).max(40),
  codigo: z.string().regex(/^P(?:0[1-9]|[1-3][0-9]|40)$/),
  etapa: z.enum(["perfil", "diagnostico", "seguranca", "financeiro", "motivacao"]),
  area: z.string().trim().min(1),
  pontua: z.boolean(),
  privada: z.boolean().optional().default(false),
  pergunta: z.string().trim().min(1),
  descricao: z.string().trim().min(1).optional(),
  alternativas: z.array(optionSchema).length(3),
}).strict();

const definitionSchema = z.object({
  questionario: z.object({
    codigo: z.literal("PROVA_ADMISSAO_CONTRATO_CASAMENTO"),
    versao: z.literal("8.0"),
    total_perguntas: z.literal(40),
    pontuacao_minima: z.literal(0),
    pontuacao_maxima: z.literal(50),
    regra_pontuacao: z.object({
      perguntas_pontuadas: z.literal("06-30"),
      A: z.literal(0),
      B: z.literal(1),
      C: z.literal(2),
    }).strict(),
  }).strict(),
  perguntas: z.array(questionSchema).length(40),
}).strict().superRefine((definition, context) => {
  const expectedStages = (order: number) => order <= 5 ? "perfil" : order <= 30 ? "diagnostico" : order <= 33 ? "seguranca" : order <= 38 ? "financeiro" : "motivacao";
  const seenCodes = new Set<string>();
  const seenOrders = new Set<number>();
  let totalOptions = 0;
  let maximumScore = 0;

  definition.perguntas.forEach((question, index) => {
    const order = index + 1;
    const expectedCode = `P${String(order).padStart(2, "0")}`;
    const isScored = order >= 6 && order <= 30;
    const isPrivate = order >= 31 && order <= 33;
    const path = ["perguntas", index];

    const issue = (message: string, suffix: Array<string | number> = []) => context.addIssue({ code: "custom", message, path: [...path, ...suffix] });
    if (question.codigo !== expectedCode) issue(`Código esperado: ${expectedCode}.`, ["codigo"]);
    if (question.id !== order) issue(`Ordem esperada: ${order}.`, ["id"]);
    if (question.etapa !== expectedStages(order)) issue(`Etapa incompatível com ${question.codigo}.`, ["etapa"]);
    if (seenCodes.has(question.codigo)) issue("Código de pergunta duplicado.", ["codigo"]);
    if (seenOrders.has(question.id)) issue("Ordem de pergunta duplicada.", ["id"]);
    seenCodes.add(question.codigo);
    seenOrders.add(question.id);
    if (question.pontua !== isScored) issue(`Pontuação incompatível com ${question.codigo}.`, ["pontua"]);
    if (question.privada !== isPrivate) issue(`Privacidade incompatível com ${question.codigo}.`, ["privada"]);

    const letters = question.alternativas.map((option) => option.letra).join("");
    if (letters !== "ABC") issue("As alternativas devem estar na ordem A, B e C.", ["alternativas"]);
    if (new Set(question.alternativas.map((option) => option.letra)).size !== 3) issue("Letras de alternativas duplicadas.", ["alternativas"]);

    question.alternativas.forEach((option, optionIndex) => {
      totalOptions += 1;
      const expectedScore = isScored ? optionIndex : null;
      if (option.pontuacao !== expectedScore) issue(`Score inválido para ${question.codigo}.${option.letra}.`, ["alternativas", optionIndex, "pontuacao"]);
    });
    if (isScored) maximumScore += Math.max(...question.alternativas.map((option) => option.pontuacao ?? 0));
  });

  if (totalOptions !== 120) context.addIssue({ code: "custom", message: "O questionário deve possuir exatamente 120 alternativas.", path: ["perguntas"] });
  if (maximumScore !== 50) context.addIssue({ code: "custom", message: "A pontuação máxima calculada deve ser 50.", path: ["questionario", "pontuacao_maxima"] });
});

export type QuestionnaireSeedDefinition = z.infer<typeof definitionSchema>;

export function parseQuestionnaireSeedDefinition(input: unknown): QuestionnaireSeedDefinition {
  return definitionSchema.parse(input);
}
