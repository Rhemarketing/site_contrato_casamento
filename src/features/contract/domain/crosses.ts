import { ContractError } from "./engine";
import { renderRegisteredTemplate } from "./decisions";
import type { Catalog, Letter, PairPlan } from "./types";

export function registeredCrossParagraphs(catalog: Catalog, plans: PairPlan[], members: { id: string; name: string }[]) {
  const results: { id: string; questionId: string; text: string; source: unknown }[] = [];
  const answer = (qid: string, member: string): Letter | null => {
    const plan = plans.find(p => p.questionId === qid);
    if (!plan || plan.blockers.length || ["PRIVATE_DIAGNOSTIC", "SAFETY_FLOW", "NOT_APPLICABLE", "NO_SHARED_APPLICABILITY"].includes(plan.action ?? "")) return null;
    return Object.entries(plan.respondentsByOption ?? {}).find(([, ids]) => ids.includes(member))?.[0] as Letter ?? null;
  };
  const forms: Record<Letter, string> = { A: "palavras, elogios, agradecimentos e reconhecimento", B: "atitudes concretas de cuidado, ajuda e apoio", C: "atenção, presença e demonstrações voluntárias de carinho físico" };
  for (let i = 0; i < members.length; i++) {
    const x = members[i], y = members[1 - i];
    const expression = answer("Q004", x.id), preference = answer("Q009", y.id);
    if (expression && preference) {
      const definition = catalog.crossRules.find(r => r.id === "XR-Q004-01");
      if (definition?.templates) {
        const index = expression === "C" ? 2 + ["A", "B", "C"].indexOf(preference) : expression === preference ? 0 : 1;
        const template = definition.templates[index];
        if (!template) throw new ContractError("TEMPLATE_MISSING");
        results.push({ id: `${definition.id}:${x.id}`, questionId: "Q004", source: definition.source,
          text: renderRegisteredTemplate(template, { "Nome X": x.name, "Nome Y": y.name, forma: forms[preference], forma_X: forms[expression], forma_Y: forms[preference] }) });
      }
    }
    const deciding = answer("Q002", x.id), heard = answer("Q020", y.id);
    if (deciding && heard === "C") {
      const definition = catalog.crossRules.find(r => r.id === "XR-Q020-01");
      if (definition?.templates) {
        const template = definition.templates[["A", "B", "C"].indexOf(deciding)];
        if (!template) throw new ContractError("TEMPLATE_MISSING");
        results.push({ id: `${definition.id}:${x.id}`, questionId: "Q020", source: definition.source,
          text: renderRegisteredTemplate(template, { "Nome A": x.name, "Nome B": x.name, "Nome C": y.name, "Nome 002-C": x.name, "Nome 020-C": y.name }) });
      }
    }
  }
  return results;
}
