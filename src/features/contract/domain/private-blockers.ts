import { responseState } from "./engine";
import type { Catalog, SessionData } from "./types";

export type PrivateBlocker = { id: string; questionId: string; title: string; blocking: boolean; selected: string; reason: string; nextStep: string };

// Only for the authenticated owner's private area, never for a shared projection.
export function privateBlockers(catalog: Catalog, data: SessionData): PrivateBlocker[] {
  const result: PrivateBlocker[] = [];
  for (const question of catalog.questions) {
    const state = responseState(question, data);
    const answer = data.answers[question.id];
    const option = question.options.find(o => o.code === answer);
    const selected = option ? `${option.code}. ${option.text}` : "Nenhuma alternativa registrada.";
    const add = (suffix: string, reason: string, nextStep: string, selection = selected, blocking = true) => result.push({
      id: `${question.id}-${suffix}`, questionId: question.id, title: question.title, blocking, selected: selection, reason, nextStep,
    });
    const level = state !== "NOT_APPLICABLE" ? catalog.safetyLevels[question.id]?.[answer] : undefined;
    if (level === "CRITICO") {
      add("critical", "Esta resposta acionou um alerta crítico privado. Ele não impede continuar ou criar o contrato.", "Considere buscar apoio individual adequado à sua situação. Você pode continuar para as decisões e o contrato sem revisão.", selected, false);
    } else if ((level || question.id === "Q119" && ["B", "C"].includes(answer) || question.id === "Q162" && answer === "C")) {
      add("review", "Esta resposta gerou uma orientação privada, sem exigência de revisão.", "Leia a orientação e prossiga normalmente para as decisões e o contrato.", selected, false);
    }
    if (state === "NOT_ANSWERED" || state === "BLOCKED_BY_POLICY") {
      const fields = question.applicability && "context_equals" in question.applicability ? Object.keys(question.applicability.context_equals) : [];
      const contexts = fields.map(id => `${catalog.contextDefinitions?.[id]?.label ?? id}: ${data.context[id] === true ? "Sim" : data.context[id] === false ? "Não" : "Não informado"}`).join(" · ");
      add("pending", "Esta pergunta ainda tem resposta ou contexto pendente e impede concluir o questionário.", "Abra Minhas respostas e preencha a pergunta ou seu contexto.", contexts ? `${selected} Contexto: ${contexts}` : selected);
    }
    for (const privateModule of catalog.privateModules.filter(m => m.questionId === question.id && m.trigger.includes(answer) && !data.privateAnswers[m.id])) {
      add(privateModule.id, `A alternativa selecionada exige um complemento privado ainda não preenchido: ${privateModule.prompt}`, "Abra esta pergunta em Minhas respostas e preencha o complemento privado.");
    }
    if (question.id === "Q103" && data.neckCompressionReport !== false) {
      add("neck", data.neckCompressionReport === true ? "Este complemento aciona um alerta crítico privado, sem bloquear a criação do contrato." : "Este complemento obrigatório está pendente e impede concluir o questionário.", data.neckCompressionReport === true ? "Considere buscar apoio individual adequado. Você pode continuar sem revisão." : "Preencha o complemento da Q103 em Minhas respostas.", `Complemento — Houve estrangulamento, sufocamento intencional ou compressão deliberada do pescoço, mesmo uma vez? Resposta: ${data.neckCompressionReport === true ? "Sim" : "Não informada"}.`, data.neckCompressionReport === null);
    }
  }
  return result;
}
