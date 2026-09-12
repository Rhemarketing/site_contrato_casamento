// @vitest-environment node
import { describe, expect, it } from "vitest";
import { contractCatalog as catalog } from "../server/catalog";
import { applicability, assessSafety, catalogReadiness, EMPTY_SESSION, evaluatePredicate, normalizePair, planPair, responseState } from "./engine";
import { bothConfirmed, renderRegisteredTemplate, validateDecision } from "./decisions";
import type { Letter } from "./types";

const letters: Letter[] = ["A", "B", "C"];
const base = { members: ["member-1", "member-2"] as [string, string], applicable: [true, true] as [boolean, boolean], safetyCleared: true, criticalSafety: false, facts: {} };
describe("arquivo-mestre 1.4.0", () => {
  it("inventaria exatamente 200 perguntas, 1.200 pares e 487 redações, sem publicar candidatos", () => {
    expect(catalogReadiness(catalog)).toMatchObject({ questions: 200, pairs: 1200, jointTexts: 487, missingApplicability: 184, compiledModules: 8, pendingModules: 48, pendingCrossRules: 96, productionReady: false });
    expect(new Set(catalog.rules.map(r => r.id)).size).toBe(1200);
    expect(catalog.components.every(c => !c.active && c.template === null)).toBe(true);
  });
  it("resolve os 1.800 arranjos ordenados sem perder a identidade das pessoas", () => {
    for (const q of catalog.questions) for (const a of letters) for (const b of letters) {
      const plan = planPair(catalog, { ...base, questionId: q.id, answers: [a, b] });
      expect(plan.key).toBe([a, b].sort().join(""));
      expect(plan.action).toBeTruthy();
      expect(plan.respondentsByOption?.[a]).toContain("member-1");
      expect(plan.respondentsByOption?.[b]).toContain("member-2");
      if (["SAFETY_FLOW", "PRIVATE_DIAGNOSTIC"].includes(plan.action!)) {
        expect(plan.selections).toEqual([]); expect(plan.modules).toEqual([]);
      }
    }
    expect(normalizePair("one", "B", "two", "A").byOption.A).toEqual(["two"]);
    expect(() => normalizePair("one", "A", "one", "C")).toThrow();
  });
  it("não interpreta ausente/inaplicável como A, nem desconhecido como falso", () => {
    const q = catalog.questions.find(q => q.id === "Q110")!;
    expect(applicability(q, {})).toBeNull();
    expect(applicability(q, { HAS_CHILDREN_OR_DEPENDENTS: false })).toBe(false);
    expect(responseState(q, { ...EMPTY_SESSION, context: { HAS_CHILDREN_OR_DEPENDENTS: false }, answers: { Q110: "A" } })).toBe("NOT_APPLICABLE");
    expect(applicability(catalog.questions[0], {})).toBeNull();
    expect(planPair(catalog, { ...base, questionId: "Q110", answers: ["NOT_APPLICABLE", "A"], applicable: [false, true] }).blockers).toEqual(["UNILATERAL_RULE_MISSING"]);
    expect(planPair(catalog, { ...base, questionId: "Q110", answers: ["NOT_APPLICABLE", "NOT_APPLICABLE"], applicable: [false, false] }).selections).toEqual([]);
    expect(planPair(catalog, { ...base, questionId: "Q001", answers: ["NOT_ANSWERED", "A"] }).key).toBeUndefined();
    const fact = { op: "fact", name: "event" } as const;
    expect(evaluatePredicate({ op: "not", item: fact }, "AA", {})).toBeNull();
    expect(evaluatePredicate({ op: "all", items: [fact, { op: "literal", value: false }] }, "AA", {})).toBe(false);
    expect(evaluatePredicate({ op: "any", items: [fact, { op: "literal", value: true }] }, "AA", {})).toBe(true);
  });
  it("segurança precede os pares; episódio de compressão é crítico mesmo em B", () => {
    expect(assessSafety(catalog, { ...EMPTY_SESSION, answers: { Q103: "B" }, neckCompressionReport: true }).critical).toBe(true);
    expect(assessSafety(catalog, { ...EMPTY_SESSION, answers: { Q104: "C" } }).critical).toBe(true);
    expect(assessSafety(catalog, { ...EMPTY_SESSION, answers: { Q101: "A" } }).cleared).toBe(false);
    const plan = planPair(catalog, { ...base, questionId: "Q001", answers: ["A", "A"], criticalSafety: true });
    expect(plan).toMatchObject({ action: "SAFETY_FLOW", selections: [], modules: [], protocols: [{ id: "P13", privacy: "SAFETY_PRIVATE", recipients: [] }] });
  });
  it("preserva as exceções Q146, Q154, Q131 e os módulos privados", () => {
    const reproductive = planPair(catalog, { ...base, questionId: "Q146", answers: ["A", "C"] });
    expect(reproductive.modules).toEqual([]); expect(reproductive.protocols[0].id).toBe("P09");
    for (const a of letters) for (const b of letters) {
      const rule = catalog.rules.find(r => r.questionId === "Q154" && r.key === [a, b].sort().join(""))!;
      expect(rule.fixedComponentIds).toContain("OUT-Q154-FIXED");
      expect(planPair(catalog, { ...base, questionId: "Q154", answers: [a, b] }).modules).toEqual([]);
    }
    expect(catalog.modules.find(m => m.id === "ND-Q131-01")?.compiled).toBe(false);
    expect(catalog.privateModules.find(m => m.questionId === "Q081")?.trigger).toEqual(["C"]);
    expect(catalog.privateModules.find(m => m.questionId === "Q119")?.trigger).toEqual(["B", "C"]);
    for (const id of ["Q196", "Q197", "Q198", "Q200"]) expect(planPair(catalog, { ...base, questionId: id, answers: ["C", "C"] }).selections).toEqual([]);
  });
  it("decisão depende do gatilho e não nasce da ausência de um fato", () => {
    const input = { ...base, questionId: "Q011", answers: ["B", "B"] as [Letter, Letter] };
    expect(planPair(catalog, input).blockers).toContain("CONTEXT_REQUIRED:COND-Q011");
    expect(planPair(catalog, { ...input, facts: { Q011_no_frequency_defined: true } }).modules).toContain("ND-Q011-01");
    expect(planPair(catalog, { ...input, facts: { Q011_no_frequency_defined: false } }).modules).toEqual([]);
    expect(planPair(catalog, { ...base, questionId: "Q041", answers: ["A", "A"] }).modules).toEqual(["ND-Q041-01", "ND-Q041-02"]);
  });
  it("renderiza todas as 487 redações exatas e rejeita variáveis ausentes/injetadas", () => {
    for (const c of catalog.components.filter(c => c.editorialFinal)) {
      const text = renderRegisteredTemplate(c.editorialTemplate!, { "Nome 1": "Alice", "Nome 2": "Bruno" });
      expect(text).toBe(c.editorialTemplate!.replaceAll("{Nome 1}", "Alice").replaceAll("{Nome 2}", "Bruno"));
    }
    expect(() => renderRegisteredTemplate("{Nome A}", { "Nome 1": "Alice" })).toThrow();
    expect(() => renderRegisteredTemplate("{Nome 1}", { "Nome 1": "{Nome 2}" })).toThrow();
  });
  it("valida parâmetros e confirmações da mesma versão, sem presumir consenso", () => {
    const definition = catalog.modules.find(m => m.id === "ND-Q041-02")!;
    expect(() => validateDecision(definition, "C", {})).toThrow();
    expect(validateDecision(definition, "C", { "categorias 1": ["moradia"], "categorias 2": ["alimentação"] }).parameters["categorias 1"]).toEqual(["moradia"]);
    expect(() => validateDecision(definition, "A", { "texto livre": ["cláusula inventada"] })).toThrow();
    expect(bothConfirmed(["one", "two"], "new", [{ memberId: "one", hash: "new" }, { memberId: "two", hash: "old" }])).toBe(false);
    expect(bothConfirmed(["one", "two"], "new", [{ memberId: "one", hash: "new" }, { memberId: "two", hash: "new" }])).toBe(true);
  });
});
