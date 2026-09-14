import type { Catalog } from "../src/features/contract/domain/types";
type SourceComponent = { component_id: string; template_candidate: string | null; question_id?: string; output_target?: string; privacy_class?: string; source_refs?: unknown };
type SourceFixed = { fixed_rule_id: string; question_id: string; source_text: string; source_ref: unknown };
type SourceCross = { cross_rule_id: string; source_question_id: string; source_text: string; source_ref: unknown; label: string };
const normalized = (text: string) => text.replace(/\s+/g, " ").trim();
const quotes = (text: string) => [...text.matchAll(/“([^”]+)”/g)].map(m => normalized(m[1]));
// Reviewed historical/operational fragments are not contract paragraphs.
const excluded = new Set([
  "FR-Q018-01", "FR-Q050-04", "FR-Q067-01", "FR-Q183-01", "FR-Q154-SUP-04", "FR-Q192-SUP-04", "FR-Q195-SUP-04",
  "FR-Q053-12-08", "FR-Q053-12-09", "FR-Q053-12-11", "FR-Q058-12-13", "FR-Q060-12-06", "FR-Q060-12-07", "FR-Q060-12-17", "FR-Q060-12-18", "FR-Q074-12-07", "FR-Q077-12-01", "FR-Q080-12-12", "FR-Q081-12-08", "FR-Q085-12-14", "FR-Q090-12-10", "FR-Q090-12-12", "FR-Q097-12-06", "FR-Q097-12-08", "FR-Q098-12-01", "FR-Q154-TOTAL-PROHIBITION",
]);
const firstParagraph = new Set(["FR-Q016-01", "FR-Q023-01", "FR-Q048-01", "FR-Q177-01"]);
const canonicalQuotes: Record<string, number[]> = {
  "FR-PATCH50-06-Q041": [0], "FR-PATCH50-08-Q048": [0, 1], "FR-PATCH50-09-Q050": [0], "FR-PATCH50-15-Q060": [0], "FR-PATCH50-17-Q069": [0], "FR-PATCH50-22-Q085": [0, 1], "FR-PATCH50-23-Q090": [0], "FR-PATCH50-25-Q091": [0],
};
export function prepareReleaseCatalog(catalog: Catalog, sources: SourceComponent[], fixed: SourceFixed[], crosses: SourceCross[]) {
  catalog.privateGuidance = sources.flatMap(source => {
    const match = source.component_id.match(/^OUT-(Q\d{3})-([ABC])$/);
    if (!match || source.output_target !== "PRIVATE_PLAN" || !source.template_candidate || source.privacy_class === "COMMON") return [];
    const template = normalized(source.template_candidate);
    if ([...template.matchAll(/\{([^}]+)\}/g)].some(m => m[1] !== "Nome")) throw new Error(`Orientação privada sem escopo: ${source.component_id}`);
    return [{ questionId: match[1], answer: match[2] as "A" | "B" | "C", template, source: source.source_refs }];
  });
  for (const q of catalog.questions) {
    q.clauseId = q.clauseId ?? q.proposedClauseId;
    if ((!q.clauseId || !catalog.clauses.some(c => c.id === q.clauseId)) && q.options.some(o => o.privacy === "COMMON")) throw new Error(`Destino de cláusula ausente: ${q.id}`);
  }
  for (const component of catalog.components) {
    const source = sources.find(c => c.component_id === component.id);
    const candidate = component.editorialFinal ? component.editorialTemplate : source?.template_candidate;
    if (component.privacy !== "COMMON" || component.target !== "CONTRACT" || !candidate) continue;
    // Some older candidates include a quoted paragraph followed by implementation notes.
    component.template = component.editorialFinal ? candidate : candidate.trim().startsWith("“") ? quotes(candidate)[0] : normalized(candidate);
    component.active = true;
  }
  for (const rule of catalog.rules) {
    rule.active = true;
    // Q130 is an independent, optional owner-controlled registry. Q151 and Q200
    // have uniform private routing and cannot impose a shared dependency.
    if (["Q130", "Q151", "Q200"].includes(rule.questionId)) rule.dependencies = [];
    if (rule.dependencies.length) throw new Error(`Dependência não tratada: ${rule.id}`);
  }
  catalog.fixedRules = [];
  const add = (source: SourceFixed, text: string, index = 0) => {
    const template = normalized(text.replace(/\{Nome\s+([12])\}/g, "{Nome $1}"));
    if (!template || [...template.matchAll(/\{([^}]+)\}/g)].some(m => !["Nome 1", "Nome 2"].includes(m[1]))) throw new Error(`Regra fixa sem binding: ${source.fixed_rule_id}`);
    catalog.fixedRules!.push({ id: `${source.fixed_rule_id}:${index}`, questionId: source.question_id, template, source: source.source_ref });
  };
  for (const source of fixed) {
    if (excluded.has(source.fixed_rule_id)) continue;
    if (canonicalQuotes[source.fixed_rule_id]) {
      for (const index of canonicalQuotes[source.fixed_rule_id]) add(source, quotes(source.source_text)[index], index);
    } else if (source.fixed_rule_id.startsWith("FR-PATCH")) continue;
    else if (/PATCH[67]0$/.test(source.fixed_rule_id)) quotes(source.source_text).forEach((text, i) => add(source, text, i));
    else if (firstParagraph.has(source.fixed_rule_id)) add(source, source.source_text.split("\n\n")[0]);
    else if (source.fixed_rule_id === "FR-Q068-01") add(source, source.source_text.replace("Parágrafo de privacidade", ""));
    else add(source, source.source_text.trim().startsWith("“") ? quotes(source.source_text)[0] : source.source_text);
  }
  const q002 = fixed.find(f => f.fixed_rule_id === "FR-PATCH50-03-Q002")!;
  add(q002, q002.source_text.split("Serão sempre consideradas")[1].split("A regra anterior")[0].replace(/^/, "Serão sempre consideradas").replace(/[*>]/g, ""));
  const q097 = fixed.find(f => f.fixed_rule_id === "FR-PATCH50-26-Q097")!;
  add(q097, q097.source_text.split("### Nova regra")[1].split("---")[0].replace(/\*\*/g, ""));
  const porn = fixed.find(f => f.fixed_rule_id === "FR-PATCH50-15-Q060")!;
  add(porn, porn.source_text.split("Não entra nessa definição")[1].split("### Para")[0].replace(/^/, "Não entra nessa definição"), 1);
  // Exact canonical prefix supersedes the shortened historical reserve prefix.
  for (const definition of catalog.modules.filter(m => m.questionId === "Q037")) for (const option of definition.options) {
    option.template = option.template.replace(/(?:depois|após) de atendidas as despesas essenciais/gi, "depois de atendidas as despesas essenciais, obrigações contratuais, parcelas vencíveis e demais compromissos financeiros obrigatórios");
  }
  catalog.crossRules = crosses.map(source => {
    const kind = ["XR-Q004-01", "XR-Q020-01"].includes(source.cross_rule_id) ? "REGISTERED_CROSS_TEXT" : ["XR-Q002-01", "XR-Q009-01"].includes(source.cross_rule_id) ? "REUSE_CANONICAL_CROSS" : "INDIVIDUAL_CONTEXT_LINK";
    const relatedQuestionIds = [...new Set([source.source_question_id, ...[...(source.label + " " + source.source_text).matchAll(/\bQ?(\d{3})\b/g)].map(m => `Q${m[1]}`)])].filter(id => catalog.questions.some(q => q.id === id));
    return { id: source.cross_rule_id, status: kind, sourceQuestionId: source.source_question_id, relatedQuestionIds, predicate: { kind, requiresApplicableAnswers: relatedQuestionIds }, templates: kind === "REGISTERED_CROSS_TEXT" ? quotes(source.source_text) : [], source: source.source_ref };
  });
}
