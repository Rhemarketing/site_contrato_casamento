// @vitest-environment node
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import original from "../../../../contrato_casamento_mestre/dados/perguntas.json";
import { contractCatalog as catalog } from "../server/catalog";
import { applicability, applicabilityContextFields, EMPTY_SESSION, planPair, responseState } from "./engine";
import { APPLICABILITY_VERSION, applicabilityDecisions, contextDefinitions } from "./applicability-policy";

const question = (id: string) => catalog.questions.find(q => q.id === id)!;
describe("decisões delegadas de aplicabilidade", () => {
  it("cobre exatamente as 184 lacunas e mantém integralmente as 16 regras de origem", () => {
    const absent = original.filter(q => !q.applicability_rule).map(q => q.question_id);
    expect(applicabilityDecisions.map(d => d.questionId)).toEqual(absent);
    expect(new Set(applicabilityDecisions.map(d => d.questionId)).size).toBe(184);
    expect(applicabilityDecisions.filter(d => "always" in d.rule)).toHaveLength(128);
    for (const q of original.filter(q => q.applicability_rule)) {
      expect(question(q.question_id).applicability).toEqual(q.applicability_rule);
      expect(question(q.question_id).applicabilityDecision).toBeUndefined();
    }
    for (const q of original) {
      expect(question(q.question_id).prompt).toBe(q.prompt_text);
      expect(question(q.question_id).options.map(o => o.text)).toEqual(q.options.map(o => o.text));
    }
    expect(catalog.version).toBe("1.4.0-release.1");
    expect(catalog.version).not.toBe("1.4.0");
    expect(catalog.applicabilityPolicy).toEqual({ version: APPLICABILITY_VERSION,
      hash: createHash("sha256").update(JSON.stringify({ version: APPLICABILITY_VERSION, applicabilityDecisions, contextDefinitions })).digest("hex") });
  });
  it("avalia todas as condições sem confundir não, desconhecido, falta de resposta e A", () => {
    for (const q of catalog.questions) {
      const fields = applicabilityContextFields(q);
      if (!fields.length) {
        expect(applicability(q, {}), q.id).toBe(true);
        expect(responseState(q, EMPTY_SESSION), q.id).toBe("NOT_ANSWERED");
        continue;
      }
      for (const field of fields) expect(catalog.contextDefinitions?.[field]?.help, `${q.id}/${field}`).toBeTruthy();
      expect(applicability(q, {}), q.id).toBeNull();
      const yes = Object.fromEntries(fields.map(f => [f, true]));
      expect(applicability(q, yes), q.id).toBe(true);
      for (const field of fields) {
        expect(applicability(q, { ...yes, [field]: null }), q.id).toBeNull();
        expect(responseState(q, { ...EMPTY_SESSION, context: { ...yes, [field]: false }, answers: { [q.id]: "A" } }), q.id).toBe("NOT_APPLICABLE");
      }
    }
    expect(applicability({ ...question("Q001"), applicability: null }, {})).toBeNull();
    expect(applicability({ ...question("Q001"), applicability: { context_equals: {} } }, {})).toBeNull();
  });
  it("não permite usar ausência de prática, renda, religião ou vínculos para ocultar perguntas de segurança", () => {
    const no = Object.fromEntries(Object.keys(contextDefinitions).map(f => [f, false]));
    for (const id of ["Q101", "Q102", "Q103", "Q104", "Q105", "Q106", "Q107", "Q108", "Q109", "Q119"]) {
      expect(applicabilityContextFields(question(id))).toEqual([]);
      expect(responseState(question(id), { ...EMPTY_SESSION, context: no })).toBe("NOT_ANSWERED");
    }
    for (const id of ["Q051", "Q057", "Q060", "Q067", "Q151", "Q153", "Q154"]) expect(applicability(question(id), no)).toBe(true);
    expect(applicability(question("Q110"), no)).toBe(false);
  });
  it("preserva não desejo de filhos e libera Q181 pelo contexto sem revisão", () => {
    const context = { FAMILY_EXPANSION_RELEVANT: true, PREGNANCY_POSSIBLE: false, RESPONSABILIDADE_PARENTAL: false };
    expect(responseState(question("Q146"), { ...EMPTY_SESSION, context, answers: { Q146: "C" } })).toBe("C");
    expect(applicability(question("Q069"), context)).toBe(false);
    const asserted = { KNOWN_TRUST_BREACH: true, REBUILDING_CHOSEN: true, Q181_SAFE_APPROACH: true, safety_cleared: true };
    expect(responseState(question("Q181"), { ...EMPTY_SESSION, context: asserted, answers: { Q181: "A" } })).toBe("A");
    expect(applicability(question("Q181"), { ...asserted, KNOWN_TRUST_BREACH: false })).toBe(false);
  });
  it("não cria uma combinação quando os contextos privados divergem", () => {
    const q = question("Q047");
    const a = { ...EMPTY_SESSION, context: { RESPONSABILIDADE_PARENTAL: true }, answers: { Q047: "B" as const } };
    const b = { ...EMPTY_SESSION, context: { RESPONSABILIDADE_PARENTAL: false } };
    const plan = planPair(catalog, { questionId: q.id, members: ["a", "b"], applicable: [applicability(q, a.context), applicability(q, b.context)],
      answers: [responseState(q, a), responseState(q, b)], safetyCleared: true, criticalSafety: false, facts: {} });
    expect(plan.action).toBe("NO_SHARED_APPLICABILITY"); expect(plan.blockers).toEqual([]);
    expect(plan.key).toBeUndefined(); expect(plan.selections).toEqual([]); expect(plan.modules).toEqual([]);
  });
});
