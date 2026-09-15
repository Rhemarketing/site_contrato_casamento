import type { Catalog, Facts, Letter, PairKey, PairPlan, Predicate, Question, ResponseState, SessionData } from "./types";

export class ContractError extends Error {
  constructor(readonly code: string) { super(code); this.name = "ContractError"; }
}
export function evaluatePredicate(node: Predicate | null, pair: string, facts: Facts): boolean | null {
  if (!node) return null;
  switch (node.op) {
    case "literal": return typeof node.value === "boolean" ? node.value : null;
    case "fact": return typeof facts[node.name] === "boolean" ? facts[node.name] : null;
    case "any_answer": return node.codes.some(c => pair.includes(c));
    case "not": { const value = evaluatePredicate(node.item, pair, facts); return value === null ? null : !value; }
    case "all": case "any": {
      const values = node.items.map(n => evaluatePredicate(n, pair, facts));
      return node.op === "all" ? values.includes(false) ? false : values.includes(null) ? null : true
        : values.includes(true) ? true : values.includes(null) ? null : false;
    }
    default: return null;
  }
}
export function applicability(question: Question, facts: Facts, _privateReviewCleared = false): boolean | null {
  void _privateReviewCleared; // Compatibility with callers using archived review metadata.
  const rule = question.applicability;
  if (!rule) return null;
  if ("always" in rule) return rule.always === true ? true : null;
  const expected = rule.context_equals;
  if (!expected || !Object.keys(expected).length) return null;
  const values = Object.entries(expected).map(([name, value]) => typeof facts[name] === "boolean" ? facts[name] === value : null);
  if (values.includes(false)) return false;
  if (values.includes(null)) return null;
  // Legacy catalog snapshots may still contain requires_private_review.
  // Applicability now depends only on the respondent's context.
  return true;
}
export function applicabilityContextFields(question: Question): string[] {
  return question.applicability && "context_equals" in question.applicability
    ? Object.keys(question.applicability.context_equals) : [];
}
export function responseState(question: Question, data: SessionData): ResponseState {
  const applicable = applicability(question, data.context, data.privateClearance?.q181 === true);
  if (applicable === null) return "BLOCKED_BY_POLICY";
  if (applicable === false) return "NOT_APPLICABLE";
  return data.answers[question.id] ?? "NOT_ANSWERED";
}
export function normalizePair(member1: string, a: Letter, member2: string, b: Letter) {
  if (!member1 || !member2 || member1 === member2 || !["A", "B", "C"].includes(a) || !["A", "B", "C"].includes(b)) throw new ContractError("INVALID_PAIR");
  return { key: [a, b].sort().join("") as PairKey,
    byOption: Object.fromEntries(["A", "B", "C"].map(code => [code, [[member1, a], [member2, b]].filter(([, v]) => v === code).map(([id]) => id)])) };
}
export function assessSafety(catalog: Catalog, data: SessionData) {
  const questions = catalog.questions.filter(q => /^Q10[1-9]$|^Q110$/.test(q.id));
  const states = questions.map(q => responseState(q, data));
  const complete = states.every(s => ["A", "B", "C", "NOT_APPLICABLE"].includes(s)) && data.neckCompressionReport !== null;
  const levels = Object.entries(catalog.safetyLevels).flatMap(([id, levels]) => levels[data.answers[id]] && states[questions.findIndex(q => q.id === id)] !== "NOT_APPLICABLE" ? [levels[data.answers[id]]] : []);
  const critical = data.neckCompressionReport === true || levels.includes("CRITICO");
  const twoBs = states.filter(s => s === "B").length >= 2;
  const otherSafety = data.answers.Q162 === "C" || ["B", "C"].includes(data.answers.Q119);
  const reviewRequired = critical || levels.length > 0 || otherSafety;
  const level = critical ? "CRITICO" : levels.includes("ALTO") || twoBs || otherSafety ? "ALTO" : levels.length ? "BASE" : "SEM_ALERTA_REGISTRADO";
  return { critical, reviewRequired, complete, level, cleared: complete && !critical && (!reviewRequired || data.privateClearance?.safety === true) };
}
export function planPair(catalog: Catalog, input: {
  questionId: string; members: [string, string]; answers: [ResponseState, ResponseState];
  applicable: [boolean | null, boolean | null]; safetyCleared: boolean; criticalSafety: boolean; facts: Facts;
}): PairPlan {
  const plan: PairPlan = { visibility: "INTERNAL_ONLY", questionId: input.questionId, action: null, selections: [], modules: [], blockers: [], protocols: [] };
  const protocol = (id: string, privacy: "COMMON" | "PRIVATE" | "SAFETY_PRIVATE", recipients: string[] = []) => plan.protocols.push({ id, privacy, recipients });
  if (input.applicable.some(a => a === null)) { plan.blockers.push("APPLICABILITY_UNKNOWN"); return plan; }
  if (input.applicable.some(a => a === false)) {
    plan.action = input.applicable.every(a => a === false) ? "NOT_APPLICABLE" : "NO_SHARED_APPLICABILITY";
    return plan;
  }
  if (input.answers.some(a => !["A", "B", "C"].includes(a))) { plan.blockers.push("ANSWERS_INCOMPLETE"); return plan; }
  const answers = input.answers as [Letter, Letter];
  const normalized = normalizePair(input.members[0], answers[0], input.members[1], answers[1]);
  plan.key = normalized.key;
  plan.respondentsByOption = normalized.byOption;
  const rule = catalog.rules.find(r => r.questionId === input.questionId && r.key === normalized.key);
  if (!rule) { plan.blockers.push("PAIR_RULE_MISSING"); return plan; }
  // Constant routing across EVERY option of a question containing a private option.
  // Publishing AA while omitting AC would expose a private C through absence.
  if (catalog.questions.find(q => q.id === input.questionId)?.options.some(o => o.privacy !== "COMMON")) {
    plan.action = "PRIVATE_DIAGNOSTIC";
    return plan;
  }
  plan.action = rule.action;
  plan.blockers.push(...rule.dependencies);
  if (rule.action === "SAFETY_FLOW") { protocol("P13", "SAFETY_PRIVATE"); return plan; }
  if (rule.action === "PRIVATE_DIAGNOSTIC") {
    for (const step of rule.steps) {
      if (step.operation === "TRIGGER_PROTOCOL" && step.protocol_id && evaluatePredicate(step.when, normalized.key, input.facts) === true) {
        protocol(step.protocol_id, "PRIVATE", input.members.filter((_, i) => answers[i] === "C"));
      }
    }
    // Even common-looking content selected by a private branch cannot be shared.
    return plan;
  }
  if (rule.action === "NO_ADDITIONAL_OUTPUT") return plan;
  if (!["MERGE_EXACT_TEXT", "KEEP_INDIVIDUAL_OUTPUTS", "USE_COMPATIBILITY_TEXT", "OPEN_NOS_DECIDIMOS", "TRIGGER_PROTOCOL"].includes(rule.action)) {
    plan.blockers.push("ACTION_NOT_IMPLEMENTED"); return plan;
  }
  if (rule.action === "TRIGGER_PROTOCOL") rule.protocolIds.forEach(id => protocol(id, "COMMON"));
  if (rule.componentId) plan.selections.push({ componentId: rule.componentId });
  else input.members.forEach((respondentId, index) => plan.selections.push({ componentId: `OUT-${input.questionId}-${answers[index]}`, respondentId }));
  for (const step of rule.steps) {
    const verdict = evaluatePredicate(step.when, normalized.key, input.facts);
    if (verdict === null) plan.blockers.push(`CONTEXT_REQUIRED:${step.condition_id ?? step.operation}`);
    else if (verdict === true && step.operation === "OPEN_NOS_DECIDIMOS" && !rule.jointBlocked) {
      for (const id of step.module_ids ?? []) {
        const definition = catalog.modules.find(m => m.id === id);
        if (!definition?.compiled) plan.blockers.push(`MODULE_INCOMPLETE:${id}`);
        else plan.modules.push(id);
      }
    }
  }
  plan.blockers = [...new Set(plan.blockers)];
  if (input.questionId === "Q146" && normalized.key === "AC" && input.facts.Q146_sufficient_consensus === true && input.facts.Q146_both_agree_to_joint_decision === true) plan.modules.push("ND-Q146-01");
  return plan;
}
export function catalogReadiness(catalog: Catalog) {
  return {
    productionReady: catalog.productionReady && catalog.questions.every(q => q.applicability) && catalog.crossRules.every(r => r.predicate) && !catalog.modules.some(m => !m.compiled && m.status === "REQUIRES_STRUCTURED_CONSOLIDATION"),
    questions: catalog.questions.length, pairs: catalog.rules.length,
    jointTexts: catalog.components.filter(c => c.editorialFinal).length,
    missingApplicability: catalog.questions.filter(q => !q.applicability).length,
    privateReviewApplicability: 0,
    compiledModules: catalog.modules.filter(m => m.compiled && !m.operational).length,
    pendingModules: catalog.modules.filter(m => !m.compiled && m.status === "REQUIRES_STRUCTURED_CONSOLIDATION").length,
    pendingCrossRules: catalog.crossRules.filter(r => !r.predicate).length,
    decisions: [] as string[],
    deferred: ["Gateway e cobrança real: somente após os testes do usuário em produção"],
  };
}
export const EMPTY_SESSION: SessionData = { answers: {}, privateAnswers: {}, context: {}, neckCompressionReport: null };
