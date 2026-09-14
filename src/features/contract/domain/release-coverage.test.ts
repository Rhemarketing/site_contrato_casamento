// @vitest-environment node
import { expect, it } from "vitest";
import { contractCatalog } from "../server/catalog";
import { generateRegisteredDraft } from "../server/generator";
import { proposalHash } from "../server/privacy";
import { planPair } from "./engine";
import { validateDecision } from "./decisions";
import type { DecisionColumn, DecisionField, Letter, PairPlan } from "./types";

it("renderiza todos os arranjos e ramos elegíveis com os textos registrados, sem variáveis abertas", () => {
  const catalog = structuredClone(contractCatalog);
  // Fixed sections and scripture have their own integrity tests. Here each
  // question is isolated to cover every component and concrete-event branch.
  catalog.fixedRules = []; catalog.crossRules = []; delete catalog.bible;
  const facts = new Set<string>();
  JSON.stringify(catalog, (key, value) => { if (key === "name" && typeof value === "string") facts.add(value); return value; });
  const sample = (field: DecisionColumn | DecisionField): string => field.options?.[0] ?? ({ member: "1", date: "2027-01-15", time: "08:00", money: "100", percent: "5", number: "20", amountOrPercent: "5%" } as Record<string, string>)[field.type] ?? "Parâmetro escolhido";
  const failures: string[] = [];
  let count = 0;
  for (const question of catalog.questions) for (const a of ["A", "B", "C"] as Letter[]) for (const b of ["A", "B", "C"] as Letter[]) for (const fact of [false, true]) {
    const plan = planPair(catalog, { questionId: question.id, members: ["first", "second"], answers: [a, b], applicable: [true, true], safetyCleared: true, criticalSafety: false, facts: Object.fromEntries([...facts].map(name => [name, fact])) });
    if (plan.blockers.length) { failures.push(`${question.id}/${a}${b}/${fact}: ${plan.blockers.join(",")}`); continue; }
    try {
      const decisions = plan.modules.map(id => {
        const definition = catalog.modules.find(m => m.id === id)!;
        const option = definition.options[0];
        const parameters: Record<string, string[]> = {};
        for (const key of option.fields) {
          const field = definition.fieldDefinitions![key];
          if (field.when && !parameters[field.when.field]?.includes(field.when.value)) continue;
          parameters[key] = [field.type === "table" ? JSON.stringify(field.columns!.map(sample)) : sample(field)];
        }
        const content = validateDecision(definition, option.code, parameters);
        const hash = proposalHash(content, 1, "basis");
        return { content, hash, revision: 1, basisHash: "basis", confirmations: ["first", "second"].map(memberId => ({ memberId, hash })) };
      });
      const plans: PairPlan[] = catalog.questions.map(q => q.id === question.id ? plan : { visibility: "INTERNAL_ONLY", questionId: q.id, action: "NOT_APPLICABLE", selections: [], modules: [], protocols: [], blockers: [] });
      const draft = generateRegisteredDraft({ catalog, catalogHash: "isolated-coverage", plans, members: [{ id: "first", name: "Alice" }, { id: "second", name: "Bruno" }], consentedMemberIds: ["first", "second"], safetyCleared: true, criticalSafety: false, decisions, unresolvedDependencies: [] });
      const text = draft.sections.flatMap(s => s.paragraphs).join("\n");
      if (/[{}]|undefined|%%|ALERTA_|CONTRACT_GENERATION|CONTRIBUTION_RULE|PRIVATE_PLAN/.test(text)) failures.push(`${question.id}/${a}${b}/${fact}: resíduo editorial`);
      count++;
    } catch (error) { failures.push(`${question.id}/${a}${b}/${fact}: ${error instanceof Error ? error.message : "falha"}`); }
  }
  expect(failures).toEqual([]);
  expect(count).toBe(3600);
}, 60000);
