import { responseState } from "./engine";
import type { Catalog, SessionData } from "./types";

export type PrivateBlocker = { id: string; questionId: string; title: string; selected: string; reason: string; nextStep: string };

// Only for the authenticated owner's private area, never for a shared projection.
export function privateBlockers(catalog: Catalog, data: SessionData): PrivateBlocker[] {
  const result: PrivateBlocker[] = [];
  for (const question of catalog.questions) {
    const state = responseState(question, data);
    const answer = data.answers[question.id];
    const option = question.options.find(o => o.code === answer);
    const selected = option ? `${option.code}. ${option.text}` : "Nenhuma alternativa registrada.";
    const add = (suffix: string, reason: string, nextStep: string, selection = selected) => result.push({
      id: `${question.id}-${suffix}`, questionId: question.id, title: question.title, selected: selection, reason, nextStep,
    });
    const level = state !== "NOT_APPLICABLE" ? catalog.safetyLevels[question.id]?.[answer] : undefined;
    if (level === "CRITICO") {
      add("critical", "Esta resposta acionou um alerta crítico e pausa a etapa conjunta e a geração do contrato.", "Uma revisão não libera um alerta crítico ativo. Procure apoio individual adequado. Se houve erro de preenchimento, use Corrigir minhas respostas para registrar sua situação corretamente.");
    } else if ((level || question.id === "Q119" && ["B", "C"].includes(answer) || question.id === "Q162" && answer === "C") && !data.privateClearance?.safety) {
      add("review", "Esta resposta exige revisão privada antes da continuação conjunta.", "Solicite uma revisão privada nesta página. Se não houver revisor disponível, a revisão depende da disponibilização de um revisor pelo serviço.");
    }
    if (state === "NOT_ANSWERED" || state === "BLOCKED_BY_POLICY") {
      const fields = question.applicability && "context_equals" in question.applicability ? Object.keys(question.applicability.context_equals) : [];
      const contexts = fields.map(id => `${catalog.contextDefinitions?.[id]?.label ?? id}: ${data.context[id] === true ? "Sim" : data.context[id] === false ? "Não" : "Não informado"}`).join(" · ");
      const review = question.applicability && "requires_private_review" in question.applicability && question.applicability.requires_private_review && fields.every(id => data.context[id] === true);
      add("pending", review ? "O contexto informado exige revisão privada para liberar esta pergunta." : "Esta pergunta ainda tem resposta ou contexto pendente e impede concluir o questionário.", review ? "Solicite a revisão privada nesta página." : "Abra Minhas respostas e preencha a pergunta ou seu contexto.", contexts ? `${selected} Contexto: ${contexts}` : selected);
    }
    for (const privateModule of catalog.privateModules.filter(m => m.questionId === question.id && m.trigger.includes(answer) && !data.privateAnswers[m.id])) {
      add(privateModule.id, `A alternativa selecionada exige um complemento privado ainda não preenchido: ${privateModule.prompt}`, "Abra esta pergunta em Minhas respostas e preencha o complemento privado.");
    }
    if (question.id === "Q103" && data.neckCompressionReport !== false) {
      add("neck", data.neckCompressionReport === true ? "Este complemento aciona alerta crítico, independentemente da alternativa principal da Q103." : "Este complemento obrigatório está pendente e impede concluir o questionário.", data.neckCompressionReport === true ? "A etapa conjunta permanece pausada enquanto houver alerta crítico ativo. Se houve erro de preenchimento, corrija o registro em Minhas respostas." : "Preencha o complemento da Q103 em Minhas respostas.", `Complemento — Houve estrangulamento, sufocamento intencional ou compressão deliberada do pescoço, mesmo uma vez? Resposta: ${data.neckCompressionReport === true ? "Sim" : "Não informada"}.`);
    }
  }
  return result;
}
