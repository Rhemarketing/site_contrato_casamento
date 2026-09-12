import { ContractError } from "./engine";
import type { JointModule, Letter } from "./types";

export const FINANCIAL_CATEGORIES = ["moradia", "alimentação", "energia/água", "internet", "transporte", "filhos", "saúde", "seguros", "lazer familiar", "dívidas comuns", "outras"] as const;
export type DecisionContent = { moduleId: string; moduleVersion: string; choice: Letter; parameters: Record<string, string[]> };
export function validateDecision(definition: JointModule, choice: Letter, parameters: Record<string, string[]>): DecisionContent {
  if (!definition.compiled) throw new ContractError("MODULE_UNAVAILABLE");
  const option = definition.options.find(o => o.code === choice);
  if (!option) throw new ContractError("INVALID_DECISION");
  if (Object.keys(parameters).some(key => !option.fields.includes(key))) throw new ContractError("INVALID_DECISION");
  const normalized: Record<string, string[]> = {};
  for (const field of option.fields) {
    const values = parameters[field];
    if (!values?.length || values.length > FINANCIAL_CATEGORIES.length || values.some(v => !FINANCIAL_CATEGORIES.includes(v as typeof FINANCIAL_CATEGORIES[number]))) throw new ContractError("INVALID_DECISION");
    normalized[field] = [...new Set(values)].sort();
  }
  return { moduleId: definition.id, moduleVersion: definition.version, choice, parameters: normalized };
}
export function bothConfirmed(members: string[], hash: string, confirmations: { memberId: string; hash: string }[]) {
  if (new Set(members).size !== 2 || !hash) return false;
  return members.every(id => confirmations.some(c => c.memberId === id && c.hash === hash));
}
// Substitution is single-pass; submitted names or parameters cannot inject tokens.
export function renderRegisteredTemplate(template: string, bindings: Record<string, string>) {
  if (!template.trim()) throw new ContractError("TEMPLATE_MISSING");
  const rendered = template.replace(/\{([^}]+)\}/g, (_, token: string) => {
    if (!Object.hasOwn(bindings, token) || !bindings[token]?.trim() || /[{}]/.test(bindings[token])) throw new ContractError("UNRESOLVED_VARIABLE");
    return bindings[token];
  });
  if (/[{}]/.test(rendered)) throw new ContractError("UNRESOLVED_VARIABLE");
  return rendered;
}
