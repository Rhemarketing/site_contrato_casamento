"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  QuestionNode,
  OptionNode,
  PairRuleNode,
  NosDecidimosNode,
} from "./custom-nodes";
import { NodeInspectorDrawer } from "./node-inspector-drawer";
import {
  getQuestionGraphAction,
  publishDraftAction,
  resetDraftAction,
} from "../actions";
import type { WhiteboardOverviewDto } from "@/services/contract-whiteboard.service";
import { Button } from "@/components/ui";

interface WhiteboardCanvasProps {
  overview: WhiteboardOverviewDto;
  initialQuestionId?: string;
}

export function WhiteboardCanvas({
  overview,
  initialQuestionId = "Q001",
}: WhiteboardCanvasProps) {
  const [currentQuestionId, setCurrentQuestionId] = useState(initialQuestionId);
  const [selectedClause, setSelectedClause] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDraft, setIsDraft] = useState(overview.isDraft);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Registro de tipos de nós para o React Flow
  const nodeTypes = useMemo(
    () => ({
      questionNode: QuestionNode,
      optionNode: OptionNode,
      pairRuleNode: PairRuleNode,
      nosDecidimosNode: NosDecidimosNode,
    }),
    [],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Carrega o grafo da questão ativa
  const refreshQuestion = useCallback(
    async (qId: string) => {
      setIsLoading(true);
      setStatusMessage(null);
      try {
        const data = await getQuestionGraphAction(qId);
        setNodes(data.nodes as Node[]);
        setEdges(data.edges as Edge[]);
        setIsDraft(data.isDraft);
      } catch (err: unknown) {
        console.error("Erro ao carregar grafo da questão:", err);
        setStatusMessage("Erro ao carregar questão.");
      } finally {
        setIsLoading(false);
      }
    },
    [setNodes, setEdges],
  );

  useEffect(() => {
    let ignore = false;
    getQuestionGraphAction(currentQuestionId)
      .then((data) => {
        if (!ignore) {
          setNodes(data.nodes as Node[]);
          setEdges(data.edges as Edge[]);
          setIsDraft(data.isDraft);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error("Erro ao carregar grafo da questão:", err);
          setStatusMessage("Erro ao carregar questão.");
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentQuestionId, setNodes, setEdges]);

  // Filtragem das 200 questões para o seletor rápido
  const filteredQuestions = useMemo(() => {
    return overview.questions.filter((q) => {
      const matchClause = selectedClause === "ALL" || q.clauseId === selectedClause;
      const matchSearch =
        !searchTerm ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchClause && matchSearch;
    });
  }, [overview.questions, selectedClause, searchTerm]);

  // Navegação anterior / próxima
  const currentIndex = overview.questions.findIndex((q) => q.id === currentQuestionId);
  const prevQuestion = currentIndex > 0 ? overview.questions[currentIndex - 1] : null;
  const nextQuestion =
    currentIndex < overview.questions.length - 1
      ? overview.questions[currentIndex + 1]
      : null;

  // Ações de publicação e descarte
  async function handlePublish() {
    if (!confirm("Deseja validar e consolidar o rascunho como novo Arquivo-Mestre oficial?")) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await publishDraftAction();
      setIsDraft(false);
      setStatusMessage(`✅ Catálogo publicado com sucesso! Versão: ${res.version}`);
      await refreshQuestion(currentQuestionId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setStatusMessage(`❌ Erro na publicação: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReset() {
    if (!confirm("Tem certeza que deseja descartar as alterações do rascunho e voltar ao original?")) {
      return;
    }
    setIsLoading(true);
    try {
      await resetDraftAction();
      setIsDraft(false);
      setStatusMessage("Rascunho descartado.");
      await refreshQuestion(currentQuestionId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao descartar";
      setStatusMessage(`Erro ao descartar: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex h-[calc(100vh-140px)] min-h-[650px] w-full flex-col overflow-hidden rounded-2xl border border-line bg-stone-100 shadow-xl">
      {/* 1. BARRA SUPERIOR DE FERRAMENTAS E NAVEGAÇÃO DAS 200 QUESTÕES */}
      <header className="z-20 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-5 py-3 shadow-sm">
        {/* Lado Esquerdo: Seletor e Navegação */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botão Anterior */}
          <button
            type="button"
            disabled={!prevQuestion || isLoading}
            onClick={() => prevQuestion && setCurrentQuestionId(prevQuestion.id)}
            className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-strong hover:bg-stone-50 disabled:opacity-40"
            title="Questão anterior"
          >
            ← {prevQuestion?.id ?? "Início"}
          </button>

          {/* Seletor Rápido de Questão (Q001 a Q200) */}
          <div className="flex items-center gap-2">
            <label htmlFor="question-select" className="sr-only">
              Selecionar Questão
            </label>
            <select
              id="question-select"
              value={currentQuestionId}
              onChange={(e) => setCurrentQuestionId(e.target.value)}
              className="min-h-9 rounded-lg border border-brand/40 bg-white px-3 py-1.5 text-xs font-bold text-brand-strong shadow-sm focus:border-brand focus:outline-none"
            >
              {filteredQuestions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.id} — {q.title} {q.hasNosDecidimos ? "🤝 [NÓS DECIDIMOS]" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Botão Próxima */}
          <button
            type="button"
            disabled={!nextQuestion || isLoading}
            onClick={() => nextQuestion && setCurrentQuestionId(nextQuestion.id)}
            className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-strong hover:bg-stone-50 disabled:opacity-40"
            title="Próxima questão"
          >
            {nextQuestion?.id ?? "Fim"} →
          </button>

          {/* Filtro por Cláusula / Categoria */}
          <select
            value={selectedClause}
            onChange={(e) => setSelectedClause(e.target.value)}
            className="min-h-9 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-muted hover:border-brand/40"
          >
            <option value="ALL">Todas as Cláusulas</option>
            {overview.clauses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {/* Busca Rápida */}
          <input
            type="text"
            placeholder="Buscar por termo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-9 w-40 rounded-lg border border-line bg-white px-3 py-1.5 text-xs placeholder:text-muted/70 focus:border-brand focus:outline-none"
          />
        </div>

        {/* Lado Direito: Ações de Publicação e Status */}
        <div className="flex items-center gap-3">
          {isDraft ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300">
              <span className="size-2 rounded-full bg-amber-600 animate-ping" />
              Rascunho com alterações não publicadas
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 border border-emerald-300">
              Catálogo Publicado (v{overview.version})
            </span>
          )}

          {isDraft ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Descartar Rascunho
              </button>
              <Button
                onClick={handlePublish}
                disabled={isLoading}
                className="!py-1.5 !px-4 !text-xs !bg-brand hover:!bg-brand-strong"
              >
                Publicar Catálogo Oficial
              </Button>
            </>
          ) : null}
        </div>
      </header>

      {/* Alerta de feedback de ação */}
      {statusMessage ? (
        <div className="z-10 bg-amber-50 px-5 py-2 text-xs font-semibold text-amber-900 border-b border-amber-200 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-muted hover:text-black">
            ✕
          </button>
        </div>
      ) : null}

      {/* 2. CANVAS INTERATIVO DO WHITEBOARD (REACT FLOW) */}
      <main className="relative flex-1 bg-stone-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNode(node)}
          onPaneClick={() => setSelectedNode(null)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.6}
        >
          <Background color="#cbd5e1" gap={20} size={1.5} />
          <Controls position="bottom-left" showInteractive={false} />
          <MiniMap
            position="bottom-right"
            nodeColor={(n) => {
              if (n.type === "questionNode") return "#244b5a";
              if (n.type === "optionNode") return "#64748b";
              if (n.type === "pairRuleNode") return "#059669";
              if (n.type === "nosDecidimosNode") return "#c86f5d";
              return "#94a3b8";
            }}
            className="!rounded-xl !border !border-line !shadow-md"
          />
        </ReactFlow>

        {/* Legenda Flutuante */}
        <div className="pointer-events-none absolute bottom-5 left-16 z-10 hidden rounded-xl border border-line bg-surface/90 p-3 text-[11px] shadow-sm backdrop-blur-sm sm:flex sm:flex-col gap-1.5">
          <div className="font-bold text-brand-strong">Legenda do Mapa:</div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-brand" />
            <span>Nó 1: Questão Oficial</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-slate-500" />
            <span>Nó 2: Opções Individuais (A/B/C)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-emerald-600" />
            <span>Nó 3: Combinações do Casal (Pares)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-amber-600" />
            <span>Nó 4: Módulo NÓS DECIDIMOS</span>
          </div>
          <p className="mt-1 text-[10px] text-muted italic">
            * Clique em qualquer nó para abrir o editor lateral.
          </p>
        </div>
      </main>

      {/* 3. DRAWER / INSPECTOR LATERAL DE EDIÇÃO */}
      {selectedNode ? (
        <NodeInspectorDrawer
          key={selectedNode.id}
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSaveSuccess={() => void refreshQuestion(currentQuestionId)}
        />
      ) : null}
    </div>
  );
}
