"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import {
  updateQuestionAction,
  updatePairRuleAction,
  updateNosDecidimosModuleAction,
} from "../actions";

import type { Node } from "@xyflow/react";

interface NodeInspectorDrawerProps {
  selectedNode: Node | null;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export function NodeInspectorDrawer({
  selectedNode,
  onClose,
  onSaveSuccess,
}: NodeInspectorDrawerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const nodeData = (selectedNode?.data ?? {}) as Record<string, unknown>;

  // Estados locais para formulários derivados do nó selecionado
  const [questionForm, setQuestionForm] = useState(() => ({
    title: (nodeData.title as string) ?? "",
    prompt: (nodeData.prompt as string) ?? "",
    period: (nodeData.period as string) ?? "Últimos 90 dias",
    options: (nodeData.options as Array<{ code: "A" | "B" | "C"; text: string; privacy: "COMMON" | "PRIVATE" }>) ?? [
      { code: "A" as const, text: "", privacy: "COMMON" as const },
      { code: "B" as const, text: "", privacy: "COMMON" as const },
      { code: "C" as const, text: "", privacy: "COMMON" as const },
    ],
  }));

  const [pairForm, setPairForm] = useState(() => ({
    action: (nodeData.action as string) ?? "MERGE_EXACT_TEXT",
    editorialTemplate: (nodeData.template as string) ?? "",
  }));

  const [moduleForm, setModuleForm] = useState(() => ({
    title: (nodeData.title as string) ?? "",
    prompt: (nodeData.prompt as string) ?? "",
    options: (nodeData.options as Array<{ code: "A" | "B" | "C"; text: string; template: string }>) ?? [],
  }));

  if (!selectedNode) return null;

  async function handleSaveQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedNode) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await updateQuestionAction(nodeData.id as string, questionForm);
      setFeedback("Questão salva no rascunho com sucesso!");
      onSaveSuccess();
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Erro ao salvar questão.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSavePair(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedNode) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await updatePairRuleAction(nodeData.questionId as string, nodeData.key as string, pairForm);
      setFeedback("Regra do par salva no rascunho com sucesso!");
      onSaveSuccess();
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Erro ao salvar regra do par.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveModule(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedNode) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await updateNosDecidimosModuleAction(nodeData.id as string, moduleForm);
      setFeedback("Módulo Nós Decidimos salvo no rascunho!");
      onSaveSuccess();
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Erro ao salvar módulo.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-line bg-surface shadow-2xl transition-transform animate-in slide-in-from-right duration-200">
      {/* Cabeçalho do Drawer */}
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand">
            Editor do Mapa Mental
          </span>
          <h2 className="font-serif text-lg font-bold text-brand-strong">
            {selectedNode.type === "questionNode"
              ? `Editar Questão ${selectedNode.data.id}`
              : selectedNode.type === "pairRuleNode"
              ? `Regra da Combinação [${selectedNode.data.key}]`
              : selectedNode.type === "nosDecidimosNode"
              ? `Nós Decidimos: ${selectedNode.data.id}`
              : `Opção ${selectedNode.data.code}`}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-muted hover:bg-stone-100 hover:text-foreground"
          aria-label="Fechar editor"
        >
          ✕
        </button>
      </div>

      {feedback ? (
        <div className="mx-6 mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
          {feedback}
        </div>
      ) : null}

      {/* Conteúdo Dinâmico por Tipo de Nó */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {selectedNode.type === "questionNode" && (
          <form onSubmit={handleSaveQuestion} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-strong uppercase">
                Título Temático
              </label>
              <input
                type="text"
                value={questionForm.title}
                onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-white p-3 text-sm focus:border-brand focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-strong uppercase">
                Enunciado da Pergunta (Prompt)
              </label>
              <textarea
                rows={4}
                value={questionForm.prompt}
                onChange={(e) => setQuestionForm({ ...questionForm, prompt: e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-white p-3 text-sm focus:border-brand focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-strong uppercase">
                Período de Referência
              </label>
              <select
                value={questionForm.period}
                onChange={(e) => setQuestionForm({ ...questionForm, period: e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-white p-3 text-sm focus:border-brand focus:outline-none"
              >
                <option value="Últimos 90 dias">Últimos 90 dias</option>
                <option value="Últimos 2 anos">Últimos 2 anos</option>
                <option value="Sempre / Geral">Sempre / Geral</option>
              </select>
            </div>

            <div className="border-t border-line pt-4">
              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? "Salvando..." : "Salvar Questão no Rascunho"}
              </Button>
            </div>
          </form>
        )}

        {selectedNode.type === "pairRuleNode" && (
          <form onSubmit={handleSavePair} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-strong uppercase">
                Ação do Motor para a Combinação [{String(nodeData.key ?? "")}]
              </label>
              <select
                value={pairForm.action}
                onChange={(e) => setPairForm({ ...pairForm, action: e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-white p-3 text-sm focus:border-brand focus:outline-none font-semibold text-brand"
              >
                <option value="MERGE_EXACT_TEXT">MERGE_EXACT_TEXT (Consenso direto de texto)</option>
                <option value="OPEN_NOS_DECIDIMOS">OPEN_NOS_DECIDIMOS (Abrir decisão conjunta)</option>
                <option value="KEEP_INDIVIDUAL_OUTPUTS">KEEP_INDIVIDUAL_OUTPUTS (Manter saídas individuais)</option>
                <option value="USE_COMPATIBILITY_TEXT">USE_COMPATIBILITY_TEXT (Usar texto de compatibilidade)</option>
                <option value="PRIVATE_DIAGNOSTIC">PRIVATE_DIAGNOSTIC (Diagnóstico privado)</option>
                <option value="SAFETY_FLOW">SAFETY_FLOW (Fluxo de segurança)</option>
                <option value="NO_ADDITIONAL_OUTPUT">NO_ADDITIONAL_OUTPUT (Sem saída adicional)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-strong uppercase">
                Template de Redação Contratual
              </label>
              <p className="text-[11px] text-muted">
                Placeholders disponíveis: {"{Nome 1}"}, {"{Nome 2}"}
              </p>
              <textarea
                rows={5}
                value={pairForm.editorialTemplate}
                onChange={(e) => setPairForm({ ...pairForm, editorialTemplate: e.target.value })}
                placeholder="Ex: Em relação a finanças, {Nome 1} e {Nome 2} pactuam..."
                className="mt-1 w-full rounded-xl border border-line bg-white p-3 text-sm focus:border-brand focus:outline-none"
              />
            </div>

            <div className="border-t border-line pt-4">
              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? "Salvando..." : "Salvar Regra do Par"}
              </Button>
            </div>
          </form>
        )}

        {selectedNode.type === "nosDecidimosNode" && (
          <form onSubmit={handleSaveModule} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-strong uppercase">
                Título do Acordo Conjunto
              </label>
              <input
                type="text"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-white p-3 text-sm focus:border-brand focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-strong uppercase">
                Enunciado de Reflexão para o Casal
              </label>
              <textarea
                rows={3}
                value={moduleForm.prompt}
                onChange={(e) => setModuleForm({ ...moduleForm, prompt: e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-white p-3 text-sm focus:border-brand focus:outline-none"
                required
              />
            </div>

            <div className="space-y-3 border-t border-line pt-3">
              <h4 className="text-xs font-bold text-brand uppercase">
                Alternativas de Acordo Bilateral
              </h4>
              {moduleForm.options.map((opt, i) => (
                <div key={opt.code} className="rounded-xl border border-line/70 bg-stone-50 p-3 space-y-2">
                  <span className="font-bold text-xs text-brand">Opção {opt.code}</span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => {
                      const updated = [...moduleForm.options];
                      updated[i] = { ...updated[i], text: e.target.value };
                      setModuleForm({ ...moduleForm, options: updated });
                    }}
                    placeholder={`Descrição da alternativa ${opt.code}`}
                    className="w-full rounded-lg border border-line bg-white p-2 text-xs"
                  />
                  <label className="block text-[10px] uppercase font-bold text-muted">
                    Template Contratual ({opt.code})
                  </label>
                  <textarea
                    rows={3}
                    value={opt.template}
                    onChange={(e) => {
                      const updated = [...moduleForm.options];
                      updated[i] = { ...updated[i], template: e.target.value };
                      setModuleForm({ ...moduleForm, options: updated });
                    }}
                    placeholder="Texto gerado com {Nome 1}, {Nome 2}..."
                    className="w-full rounded-lg border border-line bg-white p-2 text-xs font-mono"
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-4">
              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? "Salvando..." : "Salvar Módulo Nós Decidimos"}
              </Button>
            </div>
          </form>
        )}

        {selectedNode.type === "optionNode" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-stone-50 p-4 border border-line">
              <span className="text-xs font-bold uppercase text-brand">
                Opção {String(nodeData.code ?? "")} da Questão {String(nodeData.questionId ?? "")}
              </span>
              <p className="mt-2 text-sm text-foreground">
                {String(nodeData.text ?? "")}
              </p>
              <span className="mt-3 inline-block rounded bg-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-800">
                Privacidade: {String(nodeData.privacy ?? "")}
              </span>
            </div>
            <p className="text-xs text-muted">
              Para alterar o texto desta alternativa, selecione o nó principal da Questão ({String(nodeData.questionId ?? "")}).
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
