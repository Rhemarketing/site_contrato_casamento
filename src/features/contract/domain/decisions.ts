import { ContractError } from "./engine";
import type { DecisionColumn, DecisionField, JointModule, Letter } from "./types";

export const FINANCIAL_CATEGORIES = ["moradia", "alimentação", "energia/água", "internet", "transporte", "filhos", "saúde", "seguros", "lazer familiar", "dívidas comuns", "outras"] as const;
export type DecisionContent = { moduleId: string; moduleVersion: string; choice: Letter; parameters: Record<string, string[]> };
export function validateCell(definition: DecisionColumn | DecisionField, input: string): string {
  const value = input.trim();
  if (!value || value.length > 1200 || /[{}\u0000-\u001f<>]/.test(value)) throw new ContractError("INVALID_DECISION");
  if (definition.options && !definition.options.includes(value)) throw new ContractError("INVALID_DECISION");
  if (definition.type === "member" && !["1", "2", "ambos"].includes(value)) throw new ContractError("INVALID_DECISION");
  if (definition.type === "date" && (!/^20\d{2}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) !== value)) throw new ContractError("INVALID_DECISION");
  if (definition.type === "time" && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new ContractError("INVALID_DECISION");
  if (["money", "percent", "number"].includes(definition.type)) {
    if (!/^\d{1,9}(?:[.,]\d{1,2})?$/.test(value)) throw new ContractError("INVALID_DECISION");
    const number = Number(value.replace(",", "."));
    if (definition.type === "percent" && number > 100) throw new ContractError("INVALID_DECISION");
    return String(number);
  }
  if (definition.type === "amountOrPercent") {
    const match = value.match(/^(?:R\$\s*(\d{1,9}(?:[.,]\d{1,2})?)|(\d{1,3}(?:[.,]\d{1,2})?)%)$/);
    if (!match || (match[2] && Number(match[2].replace(",", ".")) > 100)) throw new ContractError("INVALID_DECISION");
  }
  return value;
}
export function validateDecision(definition: JointModule, choice: Letter, parameters: Record<string, string[]>): DecisionContent {
  if (!definition.compiled) throw new ContractError("MODULE_UNAVAILABLE");
  const option = definition.options.find(o => o.code === choice);
  if (!option) throw new ContractError("INVALID_DECISION");
  if (Object.keys(parameters).some(key => !option.fields.includes(key))) throw new ContractError("INVALID_DECISION");
  const normalized: Record<string, string[]> = {};
  for (const field of option.fields) {
    const values = parameters[field];
    const type = definition.fieldDefinitions?.[field];
    if (type?.when && !parameters[type.when.field]?.includes(type.when.value)) {
      if (values?.length) throw new ContractError("INVALID_DECISION");
      continue;
    }
    if (!values?.length && type?.optional) { normalized[field] = []; continue; }
    if (!values?.length) throw new ContractError("INVALID_DECISION");
    if (!type) {
      if (values.length > FINANCIAL_CATEGORIES.length || values.some(v => !FINANCIAL_CATEGORIES.includes(v as typeof FINANCIAL_CATEGORIES[number]))) throw new ContractError("INVALID_DECISION");
      normalized[field] = [...new Set(values)].sort();
    } else if (type.type === "table") {
      if (values.length > (type.maxRows ?? 20) || !type.columns?.length) throw new ContractError("INVALID_DECISION");
      normalized[field] = values.map(value => {
        let row: unknown;
        try { row = JSON.parse(value); } catch { throw new ContractError("INVALID_DECISION"); }
        if (!Array.isArray(row) || row.length !== type.columns!.length || row.some(v => typeof v !== "string")) throw new ContractError("INVALID_DECISION");
        return JSON.stringify(type.columns!.map((column, i) => validateCell(column, row[i])));
      });
    } else if (type.type === "selection") {
      if (!type.options || values.length > type.options.length || values.some(v => !type.options!.includes(v))) throw new ContractError("INVALID_DECISION");
      if (["meta", "periodicidade"].includes(field) && values.length !== 1) throw new ContractError("INVALID_DECISION");
      normalized[field] = [...new Set(values)].sort();
    } else {
      if (values.length !== 1) throw new ContractError("INVALID_DECISION");
      normalized[field] = [validateCell(type, values[0])];
    }
  }
  if (normalized["Responsável"]?.[0] === "ambos") throw new ContractError("INVALID_DECISION");
  for (const [from, to] of [["data inicial", "data de revisão"], ["data inicial", "data final ou revisão"], ["inicio", "fim"]]) {
    if (normalized[from] && normalized[to] && normalized[from][0] > normalized[to][0]) throw new ContractError("INVALID_DECISION");
  }
  return { moduleId: definition.id, moduleVersion: definition.version, choice, parameters: normalized };
}
export function renderDecision(definition: JointModule, content: DecisionContent, names: Record<string, string>) {
  const valid = validateDecision(definition, content.choice, content.parameters);
  const option = definition.options.find(o => o.code === valid.choice)!;
  const bindings: Record<string, string> = { ...names, ...definition.optionBindings?.[valid.choice] };
  const format = (type: DecisionColumn | DecisionField | undefined, v: string): string => type?.type === "member" ? v === "ambos" ? `${names["Nome 1"]} e ${names["Nome 2"]}` : names[`Nome ${v}`]
    : type?.type === "money" ? Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : type?.type === "percent" ? `${v.replace(".", ",")}%` : type?.type === "date" ? v.split("-").reverse().join("/") : v;
  for (const [key, values] of Object.entries(valid.parameters)) {
    const type = definition.fieldDefinitions?.[key];
    if (!values.length && type?.optional) { bindings[key] = type.emptyText ?? "Não informado"; continue; }
    bindings[key] = type?.type === "table" ? values.map(v => {
      const row = JSON.parse(v) as string[];
      return type.columns!.map((column, i) => `${column.label}: ${format(column, row[i])}`).join("; ");
    }).join("\n") : values.map(v => format(type, v)).join(", ");
  }
  if (valid.parameters["Responsável"]) bindings.Outro = names[`Nome ${valid.parameters["Responsável"][0] === "1" ? "2" : "1"}`];
  const template = definition.templateVariants?.find(v => v.choice === valid.choice && valid.parameters[v.field]?.includes(v.value))?.template ?? option.template;
  for (const [key, type] of Object.entries(definition.fieldDefinitions ?? {})) if (type.type === "percent" && template.includes(`{${key}}%`) && bindings[key]) bindings[key] = bindings[key].replace(/%$/, "");
  const rendered = renderRegisteredTemplate(template, bindings);
  const used = new Set([...template.matchAll(/\{([^}]+)\}/g)].map(m => m[1]));
  const details = Object.keys(valid.parameters).filter(k => !used.has(k) && k !== "meta").map(k => `${definition.fieldDefinitions?.[k]?.label ?? k}: ${bindings[k]}`);
  return [rendered, ...details, ...definition.fixedTexts.map(t => renderRegisteredTemplate(t, names))];
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
