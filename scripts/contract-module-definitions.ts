import type { DecisionColumn, DecisionField, JointModule, Letter, Predicate } from "../src/features/contract/domain/types";
import { FINANCIAL_CATEGORIES } from "../src/features/contract/domain/decisions";

type SourceModule = { joint_module_id: string; question_id: string; label: string; source_text: string; source_ref: unknown; trigger_predicate: Predicate | null; status: string;
  option_candidates: { code: Letter; text_candidate: string; contract_template_candidate?: string | null }[] };
const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const quotes = (s: string) => [...s.matchAll(/“([^”]+)”/g)].map(m => clean(m[1]));
const names = ["Nome 1", "Nome 2", "Outro"];
const text = (label: string): DecisionField => ({ label, type: "text", help: "Registre somente o necessário para este acordo. Não inclua diagnóstico, documento, prova ou descrição íntima." });
const col = (label: string, type: DecisionColumn["type"] = "text"): DecisionColumn => ({ label, type });
const table = (label: string, columns: DecisionColumn[], maxRows = 20): DecisionField => ({ label, type: "table", columns, maxRows });
const tasks = table("Tarefas e responsabilidades", [col("Tarefa"), col("Responsável", "member"), col("Frequência ou prazo")]);
const parental = table("Responsabilidades parentais", [col("Área"), col("Responsável principal", "member"), col("Apoio", "member")]);
const conditions = table("Condições acordadas", [col("Condição"), col("Valor ou medida"), col("Prazo de revisão", "date")]);
const fields: Record<string, DecisionField> = {
  "pessoa": text("Pessoa / identificação de uso"), "pessoa/situação": text("Pessoa ou situação"), "motivo": text("Motivo"),
  "limites selecionados": { type: "selection", label: "Limites escolhidos", options: ["não realizar encontros deliberadamente ocultos", "comunicar encontros individuais relevantes", "não manter flerte", "não manter conversa sexualizada", "não esconder interações relevantes", "limitar comunicação ao contexto identificado", "evitar determinado contexto ou horário acordado"] },
  "limite escolhido": { type: "amountOrPercent", label: "Limite (R$ ou % da RLF)", help: "Exemplos: R$ 100,00 ou 5%. Com RLF zero, o limite percentual é zero; necessidades essenciais não ficam condicionadas a esse limite." },
  "valor/percentual": { type: "amountOrPercent", label: "Perda máxima admitida (R$ ou %)" },
  "percentual escolhido": { type: "percent", label: "Percentual escolhido" }, "percentual": { type: "percent", label: "Percentual" },
  "valor": { type: "money", label: "Valor em reais" }, "Responsável": { type: "member", label: "Responsável financeiro" }, "Nome": { type: "member", label: "Pessoa que necessita da adaptação" },
  "categorias 1": { type: "selection", label: "Categorias da pessoa 1", options: [...FINANCIAL_CATEGORIES] },
  "categorias 2": { type: "selection", label: "Categorias da pessoa 2", options: [...FINANCIAL_CATEGORIES] },
  "áreas 1": { type: "selection", label: "Áreas da pessoa 1", options: [...FINANCIAL_CATEGORIES] },
  "áreas 2": { type: "selection", label: "Áreas da pessoa 2", options: [...FINANCIAL_CATEGORIES] },
  "oportunidade": text("Oportunidade profissional"), "projeto": text("Projeto"), "projeto escolhido": text("Projeto escolhido"),
  "condições selecionadas": conditions, "condições definidas": conditions,
  "data de revisão": { type: "date", label: "Data de revisão" }, "data": { type: "date", label: "Data acordada" },
  "data inicial": { type: "date", label: "Data inicial" }, "data final ou revisão": { type: "date", label: "Data final ou revisão" },
  "apoio definido": text("Apoio definido"), "apoio": text("Apoio"), "local": text("Localidade (sem endereço detalhado)"),
  "condição objetiva": text("Condição objetiva de revisão"), "regra definida": text("Regra definida pelo casal"),
  "períodos definidos": text("Períodos sem telas"), "filho": { ...text("Identificação de uso da criança"), help: "Use apelido ou nome de uso. Não informe nome completo, escola, endereço, documentos ou dados clínicos." },
  "dormir": { type: "time", label: "Horário de dormir" }, "acordar": { type: "time", label: "Horário de acordar" }, "exceções": text("Exceções de fim de semana"),
  "divisão registrada": table("Divisão do acompanhamento escolar", [col("Escola", "member"), col("Tarefas", "member"), col("Reuniões", "member"), col("Comunicação", "member")], 1),
  "tarefas": text("Tarefas compatíveis com idade e capacidade"), "dados definidos": table("Frequência e supervisão", [col("Tarefa"), col("Frequência"), col("Supervisão", "member")]),
  "periodicidade": { type: "selection", label: "Periodicidade", options: ["semanal", "quinzenal", "mensal"] }, "modelo definido": text("Modelo de educação financeira"),
  "atividade": text("Atividade"), "regras escolhidas": table("Armazenamento e exclusão", [col("Forma de armazenamento"), col("Prazo de manutenção ou sem prazo fixo"), col("Regra de exclusão")], 1),
  "frequência escolhida": text("Frequência escolhida"), "condições escolhidas": text("Horários e condições de visita"), "familiares autorizados": text("Familiares autorizados (nomes de uso)"),
  "familiar": text("Familiar (identificação de uso)"), "responsabilidades definidas": tasks,
  "outros responsáveis/profissionais": text("Outros responsáveis ou profissionais"), "apoio financeiro/logístico/pontual": text("Apoio financeiro, logístico ou pontual"),
  "regras definidas": text("Regras de convivência"), "alternativas definidas": text("Alternativas de apoio"),
};

// Only these source modules have joint decisions. Disabled source branches remain disabled.
const extra: Record<string, Partial<Record<Letter, Record<string, DecisionField>>>> = {
  "Q044": { A: { tarefas: tasks }, B: { tarefas: tasks }, C: { tarefas: tasks } },
  "Q046": { A: { responsabilidades: parental }, B: { responsabilidades: parental }, C: { responsabilidades: parental } },
  "Q118": { C: { plano: table("Plano de formação espiritual", [col("Prática"), col("Faixa etária"), col("Frequência"), col("Responsável", "member")]) } },
  "Q148": { A: { origem: text("Origem dos recursos"), prazo: { type: "date", label: "Prazo do projeto" } } },
  "Q163": { A: { telas: table("Tempo de tela por filho", [col("Nome de uso"), col("Faixa etária"), col("Limite diário em minutos", "number"), col("Horários sem tela")]) }, C: { plano: table("Plano individual por filho", [col("Nome de uso"), col("Faixa etária"), col("Regra de tela"), col("Horários"), col("Conteúdos")]) } },
  "Q174": { B: { horarios: text("Horários de visita") }, C: { pessoas: text("Pessoas ou grupos aceitos"), horarios: text("Horários de visita") } },
  "Q093": { C: { horarios: text("Limites de horário e privacidade") } },
  "Q094": { A: { calendario: table("Calendário de datas familiares", [col("Celebração"), col("Data", "date"), col("Destino: família 1, família 2 ou casal")]) }, B: { calendario: table("Calendário de datas familiares", [col("Celebração"), col("Data", "date"), col("Destino: família 1, família 2 ou casal")]) }, C: { calendario: table("Calendário de datas familiares", [col("Celebração"), col("Data", "date"), col("Destino: família 1, família 2 ou casal")]) } },
};
const formFields: Record<string, Record<string, DecisionField>> = {
  Q134: { viagem: text("Viagem"), inicio: { type: "date", label: "Data inicial" }, fim: { type: "date", label: "Data final" }, orcamento: { type: "money", label: "Orçamento máximo" }, organizacao: table("Organização da viagem", [col("Transporte"), col("Hospedagem"), col("Responsabilidades", "member")], 1) },
  Q169: { organizacao: table("Organização dos cuidados dos filhos", [col("Agendamentos", "member"), col("Documentos", "member"), col("Medicamentos", "member"), col("Acompanhamento", "member")], 1) },
  Q092: { "família 1": text("Frequência de convivência com a família da pessoa 1"), "família 2": text("Frequência de convivência com a família da pessoa 2") },
};
const repeatable = new Set(["Q027", "Q028", "Q032", "Q049", "Q050", "Q129", "Q134", "Q144", "Q148", "Q149", "Q164", "Q165", "Q166", "Q167", "Q168", "Q169", "Q096", "Q100"]);

export function compileReleaseModule(m: SourceModule): JointModule {
  const compiled = m.status === "REQUIRES_STRUCTURED_CONSOLIDATION";
  if (!compiled) return { id: m.joint_module_id, questionId: m.question_id, title: m.label, prompt: null, predicate: m.trigger_predicate, status: m.status, compiled: false, options: [], fixedTexts: [], reusedByQuestions: [], source: m.source_ref, version: "1.4.0-forms.1" };
  const qid = m.question_id;
  const sourceQuotes = quotes(m.source_text);
  const definitions: Record<string, DecisionField> = {};
  const optionBindings: JointModule["optionBindings"] = {};
  const recordOnlyOptions: Letter[] = [];
  const templateVariants: NonNullable<JointModule["templateVariants"]> = [];
  const candidates = m.option_candidates.length ? m.option_candidates : [...m.source_text.matchAll(/^([ABC])\)\s*(.+)$/gm)].map(x => ({ code: x[1] as Letter, text_candidate: x[2], contract_template_candidate: null }));
  const isForm = Object.hasOwn(formFields, qid) || ["Q149", "Q164", "Q165", "Q166"].includes(qid);
  const choices = isForm ? [{ code: "A" as const, text_candidate: "Registrar acordo específico", contract_template_candidate: null }] : candidates;
  if (!choices.length) throw new Error(`Alternativas não consolidadas: ${m.joint_module_id}`);
  const options = choices.map((candidate, index) => {
    const code = candidate.code;
    const recorded = quotes(candidate.contract_template_candidate ?? "");
    // Corrected option candidates have precedence over historical source blocks (Q100-B, Q051).
    let template = recorded[0] ?? sourceQuotes[qid === "Q032" ? [1, 0, 2][index] : index];
    if (qid === "Q114" || qid === "Q055") {
      template = sourceQuotes[0];
      if (qid === "Q055" || code !== "C") optionBindings[code] = { "frequência escolhida": qid === "Q055" ? ["semanalmente", "quinzenalmente", "mensalmente"][index] : code === "A" ? "semanalmente" : "pelo menos 2 vezes por mês" };
    }
    if (qid === "Q051" && code === "C") {
      template = recorded[0];
      if (!recorded[1]) throw new Error("Q051 sem opção de frequência não numérica");
      templateVariants.push({ choice: code, field: "meta", value: "Sem meta numérica", template: recorded[1] });
    }
    if (qid === "Q164") template = sourceQuotes[0].replace("{horário}", "{dormir}").replace("{horário}", "{acordar}");
    if (qid === "Q168" && code === "B") template = template.replace("{data}", "{data inicial}").replace("{data}", "{data de revisão}");
    if (qid === "Q050") template = template.replace(/\{data de\s+revisão\}/g, "{data de revisão}");
    if (Object.hasOwn(formFields, qid) || (["Q118", "Q163"].includes(qid) && code === "C")) {
      template = clean(candidate.text_candidate);
      recordOnlyOptions.push(code);
    }
    if (!template) throw new Error(`Texto cadastrado ausente: ${m.joint_module_id}/${code}`);
    const required = [...new Set([...template.matchAll(/\{([^}]+)\}/g)].map(x => x[1]).filter(x => !names.includes(x) && !optionBindings[code]?.[x]))];
    for (const token of required) {
      if (!fields[token]) throw new Error(`Campo sem tipo: ${m.joint_module_id}/${code}/${token}`);
      definitions[token] = fields[token];
    }
    const supplements = formFields[qid] ?? extra[qid]?.[code] ?? {};
    Object.assign(definitions, supplements);
    if (qid === "Q051" && code === "C") {
      definitions.meta = { type: "selection", label: "Tipo de acordo de intimidade", options: ["Com frequência definida", "Sem meta numérica"] };
      definitions["frequência escolhida"] = { ...definitions["frequência escolhida"], when: { field: "meta", value: "Com frequência definida" } };
      required.unshift("meta");
    }
    return { code, text: clean(candidate.text_candidate), template, fields: [...new Set([...required, ...Object.keys(supplements)])] };
  });
  const fixedTexts: string[] = [];
  if (qid === "Q055") fixedTexts.push(...sourceQuotes.slice(1));
  if (qid === "Q120") fixedTexts.push(...sourceQuotes.slice(3));
  // Source's terminal rules are exact registered text, not generated additions.
  const rule = m.source_text.split(/\n(?:Regra importante|Regra de maturidade|Regra|PARÁGRAFO FIXO)\n/)[1]?.split(/\n(?:Aplicabilidade|---)/)[0];
  if (rule && !/[{}]/.test(rule)) fixedTexts.push(clean(rule));
  return { id: m.joint_module_id, questionId: qid, title: m.label, prompt: clean(m.label), predicate: m.trigger_predicate, status: "COMPILED_REGISTERED_SOURCE", compiled: true,
    options, fieldDefinitions: definitions, optionBindings, recordOnlyOptions, templateVariants, repeatable: repeatable.has(qid), fixedTexts,
    reusedByQuestions: qid === "Q011" ? ["Q048", "Q131"] : [], source: m.source_ref, version: "1.4.0-forms.1" };
}
