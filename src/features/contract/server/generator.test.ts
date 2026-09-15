// @vitest-environment node
import { describe, expect, it } from "vitest";
import { contractCatalog } from "./catalog";
import { generateRegisteredDraft } from "./generator";
import { planPair } from "../domain/engine";
import type { Catalog, PairPlan } from "../domain/types";

// Deliberately synthetic release and applicability: never shipped as a product rule.
function fixture() {
  const catalog: Catalog = structuredClone(contractCatalog);
  catalog.fixedRules = []; catalog.crossRules = [];
  catalog.questions.forEach(q => { q.clauseId ??= q.proposedClauseId; });
  catalog.rules.forEach(r => { r.active = true; });
  catalog.components.forEach(c => { c.active = true; });
  catalog.components.find(c => c.id === "OUT-Q154-FIXED")!.template = catalog.gamblingTemplate;
  const plans: PairPlan[] = catalog.questions.map(q => ({ visibility: "INTERNAL_ONLY", questionId: q.id, action: "NOT_APPLICABLE", selections: [], modules: [], blockers: [], protocols: [] }));
  plans[0] = planPair(catalog, { questionId: "Q001", members: ["first", "second"], answers: ["A", "A"], applicable: [true, true], safetyCleared: true, criticalSafety: false, facts: {} });
  return { catalog, catalogHash: "test-source", plans, members: [{ id: "first", name: "Alice" }, { id: "second", name: "Bruno" }] as [{ id: string; name: string }, { id: string; name: string }], consentedMemberIds: ["first", "second"], safetyCleared: true, criticalSafety: false, decisions: [], unresolvedDependencies: [] };
}
describe("montagem determinística e projeção de privacidade", () => {
  it("usa a redação final cadastrada, sem precisar reescrevê-la, e preserva proveniência", () => {
    const input = fixture();
    const draft = generateRegisteredDraft(input);
    expect(draft.sections[0].paragraphs[0]).toBe(input.catalog.components.find(c => c.id === "OUT-PAIR-Q001-AA")!.editorialTemplate!.replace("{Nome 1}", "Alice").replace("{Nome 2}", "Bruno"));
    expect(draft.provenance[0].componentId).toBe("OUT-PAIR-Q001-AA");
    expect(generateRegisteredDraft(input)).toEqual(draft);
  });
  it("não promove texto privado ou candidato a texto compartilhado", () => {
    for (const privacy of ["PRIVATE", "SAFETY_PRIVATE"] as const) {
      const input = fixture(); input.catalog.components.find(c => c.id === "OUT-PAIR-Q001-AA")!.privacy = privacy;
      expect(() => generateRegisteredDraft(input)).toThrow("SHARED_UNAVAILABLE");
    }
    const input = fixture(); const component = input.catalog.components.find(c => c.id === "OUT-PAIR-Q001-AA")!;
    component.editorialFinal = false; component.template = null;
    expect(() => generateRegisteredDraft(input)).toThrow("SHARED_UNAVAILABLE");
    component.editorialFinal = true; input.plans[0].action = "PRIVATE_DIAGNOSTIC";
    expect(() => generateRegisteredDraft(input)).toThrow("SHARED_UNAVAILABLE");
  });
  it("nega emissão incompleta, consentimento ausente ou componente inativo", () => {
    const input = fixture();
    const inactive = structuredClone(input.catalog); inactive.components.find(c => c.id === "OUT-PAIR-Q001-AA")!.active = false;
    expect(() => generateRegisteredDraft({ ...input, catalog: inactive })).toThrow();
    expect(() => generateRegisteredDraft({ ...input, unresolvedDependencies: ["UNCOMPILED_CROSS_RULE"] })).toThrow();
    expect(generateRegisteredDraft({ ...input, safetyCleared: false })).toEqual(generateRegisteredDraft(input));
    expect(generateRegisteredDraft({ ...input, criticalSafety: true })).toEqual(generateRegisteredDraft(input));
    expect(() => generateRegisteredDraft({ ...input, consentedMemberIds: ["first"] })).toThrow();
    expect(() => generateRegisteredDraft({ ...input, plans: input.plans.slice(1) })).toThrow();
  });
  it("não revela o diagnóstico de apostas pela presença ou ausência da cláusula fixa", () => {
    const input = fixture();
    const render = (answer: "A" | "C") => {
      input.plans[153] = planPair(input.catalog, { questionId: "Q154", members: ["first", "second"], answers: [answer, answer], applicable: [true, true], safetyCleared: true, criticalSafety: false, facts: {} });
      return generateRegisteredDraft(input).sections;
    };
    expect(render("C")).toEqual(render("A"));
  });
  it("vincula Nome A à pessoa que respondeu A mesmo quando é o segundo membro", () => {
    const input = fixture();
    input.plans[0] = planPair(input.catalog, { questionId: "Q001", members: ["first", "second"], answers: ["B", "A"], applicable: [true, true], safetyCleared: true, criticalSafety: false, facts: {} });
    const component = input.catalog.components.find(c => c.id === input.plans[0].selections[0].componentId)!;
    component.template = "{Nome A} e {Nome B}"; // Test-only binding probe, not a clause.
    expect(generateRegisteredDraft(input).sections[0].paragraphs).toEqual(["Bruno e Alice"]);
  });
});
