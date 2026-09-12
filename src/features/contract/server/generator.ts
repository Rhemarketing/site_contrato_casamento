import "server-only";
import type { Catalog, PairPlan } from "../domain/types";
import { ContractError } from "../domain/engine";
import { bothConfirmed, renderRegisteredTemplate, type DecisionContent } from "../domain/decisions";
import { contentHash, proposalHash } from "./privacy";

export type ContractDraft = {
  version: string; catalogHash: string; engineVersion: string;
  sections: { id: string; title: string; paragraphs: string[] }[];
  provenance: { componentId: string; version: string; source: unknown }[];
  contentHash: string;
};
export function generateRegisteredDraft(input: {
  catalog: Catalog; catalogHash: string; plans: PairPlan[];
  members: [{ id: string; name: string }, { id: string; name: string }];
  consentedMemberIds: string[]; safetyCleared: boolean; criticalSafety: boolean;
  decisions: { content: DecisionContent; hash: string; revision: number; basisHash: string; confirmations: { memberId: string; hash: string }[] }[];
  unresolvedDependencies: string[];
}): ContractDraft {
  const { catalog, members } = input;
  if (!input.safetyCleared || input.criticalSafety || members[0].id === members[1].id || members.some(m => !input.consentedMemberIds.includes(m.id))) throw new ContractError("SHARED_UNAVAILABLE");
  if (input.unresolvedDependencies.length || input.plans.length !== 200 || new Set(input.plans.map(p => p.questionId)).size !== 200 || input.plans.some(p => p.blockers.length)) throw new ContractError("SHARED_UNAVAILABLE");
  const bindings = { "Nome 1": members[0].name, "Nome 2": members[1].name };
  const paragraphs = new Map<string, string[]>();
  const provenance: ContractDraft["provenance"] = [];
  const used = new Set<string>();
  for (const plan of input.plans) {
    const question = catalog.questions.find(q => q.id === plan.questionId);
    if (!question) throw new ContractError("SHARED_UNAVAILABLE");
    if (plan.action === "NOT_APPLICABLE") {
      if (plan.selections.length || plan.modules.length) throw new ContractError("SHARED_UNAVAILABLE");
      continue;
    }
    const rule = catalog.rules.find(r => r.questionId === plan.questionId && r.key === plan.key);
    if (!rule?.active) throw new ContractError("SHARED_UNAVAILABLE");
    if (rule.privacy !== "COMMON" || ["PRIVATE_DIAGNOSTIC", "SAFETY_FLOW"].includes(plan.action ?? "")) {
      // Private-branch selections are never printable, even when their text looks harmless.
      if (plan.selections.length || plan.modules.length) throw new ContractError("SHARED_UNAVAILABLE");
      continue;
    }
    for (const selected of plan.selections) {
      if (!question.clauseId) throw new ContractError("SHARED_UNAVAILABLE");
      const component = catalog.components.find(c => c.id === selected.componentId);
      const registeredTemplate = component?.template ?? (component?.editorialFinal ? component.editorialTemplate : null);
      if (!component?.active || component.privacy !== "COMMON" || component.target !== "CONTRACT" || !registeredTemplate || component.questionId !== plan.questionId) throw new ContractError("SHARED_UNAVAILABLE");
      const identity = `${component.id}:${selected.respondentId ?? "pair"}`;
      if (used.has(identity)) continue;
      used.add(identity);
      const respondent = members.find(m => m.id === selected.respondentId);
      const optionBindings = Object.fromEntries(Object.entries(plan.respondentsByOption ?? {}).filter(([, ids]) => ids.length === 1)
        .map(([code, ids]) => [`Nome ${code}`, members.find(m => m.id === ids[0])?.name ?? ""]));
      const resolved = renderRegisteredTemplate(registeredTemplate, { ...bindings, ...optionBindings, ...(respondent ? { Nome: respondent.name } : {}) });
      paragraphs.set(question.clauseId, [...paragraphs.get(question.clauseId) ?? [], resolved]);
      provenance.push({ componentId: component.id, version: component.version, source: component.source });
    }
  }
  const modules = [...new Set(input.plans.flatMap(p => p.modules))];
  for (const id of modules) {
    const definition = catalog.modules.find(m => m.id === id);
    const decision = input.decisions.find(d => d.content.moduleId === id);
    if (!definition?.compiled || !decision || proposalHash(decision.content, decision.revision, decision.basisHash) !== decision.hash || !bothConfirmed(members.map(m => m.id), decision.hash, decision.confirmations)) throw new ContractError("SHARED_UNAVAILABLE");
    const option = definition.options.find(o => o.code === decision.content.choice);
    if (!option || definition.version !== decision.content.moduleVersion) throw new ContractError("SHARED_UNAVAILABLE");
    const text = renderRegisteredTemplate(option.template, { ...bindings, ...Object.fromEntries(Object.entries(decision.content.parameters).map(([key, values]) => [key, values.join(", ")])) });
    paragraphs.set("JOINT", [...paragraphs.get("JOINT") ?? [], text, ...definition.fixedTexts.map(t => renderRegisteredTemplate(t, bindings))]);
    provenance.push({ componentId: id, version: definition.version, source: definition.source });
  }
  // Q154 is unconditional: its presence cannot reveal anyone's answer.
  const fixed = catalog.components.find(c => c.id === "OUT-Q154-FIXED");
  if (!fixed?.active || !fixed.template || fixed.privacy !== "COMMON") throw new ContractError("SHARED_UNAVAILABLE");
  if (!used.has(`${fixed.id}:pair`)) {
    paragraphs.set("C15", [...paragraphs.get("C15") ?? [], renderRegisteredTemplate(fixed.template, bindings)]);
    provenance.push({ componentId: fixed.id, version: fixed.version, source: fixed.source });
  }
  const sections = [...catalog.clauses, { id: "JOINT", title: "Decisões específicas do casal" }].filter(c => paragraphs.has(c.id)).map(c => ({ ...c, paragraphs: paragraphs.get(c.id)! }));
  const draft = { version: catalog.version, catalogHash: input.catalogHash, engineVersion: "1.4.0-engine.1", sections, provenance };
  return { ...draft, contentHash: contentHash(draft) };
}
