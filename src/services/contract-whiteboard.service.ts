import "server-only";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { contractCatalog } from "@/features/contract/server/catalog";
import type { Catalog } from "@/features/contract/domain/types";
import { catalogReadiness } from "@/features/contract/domain/engine";
import { renderRegisteredTemplate } from "@/features/contract/domain/decisions";

const DRAFT_PATH = path.resolve("src/data/contract-whiteboard-draft.json");
const MASTER_PATH = path.resolve("src/data/contract-master-v1.4.0.json");

export interface WhiteboardQuestionSummary {
  id: string;
  order: number;
  title: string;
  clauseId: string | null;
  period: string;
  hasNosDecidimos: boolean;
  nosDecidimosModuleId?: string;
  pairActions: { pair: string; action: string }[];
}

export interface WhiteboardOverviewDto {
  version: string;
  isDraft: boolean;
  totalQuestions: number;
  totalPairs: number;
  totalModules: number;
  clauses: { id: string; title: string }[];
  questions: WhiteboardQuestionSummary[];
  readiness: ReturnType<typeof catalogReadiness>;
}

export class ContractWhiteboardService {
  /**
   * Retorna o catálogo ativo (prioriza o rascunho de edições se existir).
   */
  async getWorkingCatalog(): Promise<{ catalog: Catalog; isDraft: boolean }> {
    if (existsSync(DRAFT_PATH)) {
      try {
        const raw = await readFile(DRAFT_PATH, "utf-8");
        const catalog = JSON.parse(raw) as Catalog;
        return { catalog, isDraft: true };
      } catch (err) {
        console.error("Falha ao ler rascunho do whiteboard:", err);
      }
    }
    return { catalog: structuredClone(contractCatalog), isDraft: false };
  }

  /**
   * Retorna o resumo geral das 200 questões, cláusulas e estatísticas.
   */
  async getOverview(): Promise<WhiteboardOverviewDto> {
    const { catalog, isDraft } = await this.getWorkingCatalog();
    const readiness = catalogReadiness(catalog);

    const questions: WhiteboardQuestionSummary[] = catalog.questions.map((q) => {
      const rules = catalog.rules.filter((r) => r.questionId === q.id);
      const nosDecidimosRule = rules.find((r) => r.action === "OPEN_NOS_DECIDIMOS");
      const moduleForQuestion = catalog.modules.find((m) => m.questionId === q.id);

      return {
        id: q.id,
        order: q.order,
        title: q.title,
        clauseId: q.clauseId,
        period: q.period,
        hasNosDecidimos: Boolean(nosDecidimosRule || moduleForQuestion),
        nosDecidimosModuleId: moduleForQuestion?.id ?? nosDecidimosRule?.moduleIds?.[0],
        pairActions: rules.map((r) => ({ pair: r.key, action: r.action })),
      };
    });

    return {
      version: catalog.version,
      isDraft,
      totalQuestions: catalog.questions.length,
      totalPairs: catalog.rules.length,
      totalModules: catalog.modules.length,
      clauses: catalog.clauses,
      questions,
      readiness,
    };
  }

  /**
   * Constrói os dados do grafo (nós e arestas do React Flow) para uma questão específica.
   */
  async getQuestionGraph(questionId: string) {
    const { catalog, isDraft } = await this.getWorkingCatalog();
    const q = catalog.questions.find((x) => x.id === questionId);
    if (!q) throw new Error(`Questão "${questionId}" não encontrada.`);

    const rules = catalog.rules.filter((r) => r.questionId === q.id);
    const relatedModules = catalog.modules.filter(
      (m) => m.questionId === q.id || rules.some((r) => r.moduleIds?.includes(m.id)),
    );
    const texts = catalog.components.filter(
      (c) => c.questionId === q.id && c.editorialTemplate && c.target === "CONTRACT",
    );

    // Estruturação dos Nós para o React Flow
    const nodes: Array<Record<string, unknown>> = [];
    const edges: Array<Record<string, unknown>> = [];

    // 1. Nó Raiz: A Questão (Qxxx)
    const questionNodeId = `node-question-${q.id}`;
    nodes.push({
      id: questionNodeId,
      type: "questionNode",
      position: { x: 50, y: 250 },
      data: {
        id: q.id,
        order: q.order,
        title: q.title,
        prompt: q.prompt,
        period: q.period,
        clauseId: q.clauseId,
        applicability: q.applicability,
        applicabilityDecision: q.applicabilityDecision,
      },
    });

    // 2. Nós de Nível 1: As 3 Opções (A, B, C)
    const optionYPositions = [100, 270, 440];
    q.options.forEach((opt, idx) => {
      const optionNodeId = `node-opt-${q.id}-${opt.code}`;
      nodes.push({
        id: optionNodeId,
        type: "optionNode",
        position: { x: 420, y: optionYPositions[idx] ?? 250 },
        data: {
          questionId: q.id,
          code: opt.code,
          text: opt.text,
          privacy: opt.privacy,
        },
      });

      edges.push({
        id: `edge-${questionNodeId}-${optionNodeId}`,
        source: questionNodeId,
        target: optionNodeId,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#244b5a", strokeWidth: 2 },
      });
    });

    // 3. Nós de Nível 2: As 6 Combinações de Pares (AA, AB, AC, BB, BC, CC)
    const pairOrder = ["AA", "AB", "AC", "BB", "BC", "CC"];
    const pairYSpacing = 110;
    const startY = 30;

    pairOrder.forEach((key, idx) => {
      const rule = rules.find((r) => r.key === key);
      const pairNodeId = `node-pair-${q.id}-${key}`;
      const action = rule?.action ?? "MERGE_EXACT_TEXT";

      // Encontrar template correspondente se houver
      const comp = texts.find((c) => c.id === rule?.componentId || c.id === `OUT-PAIR-${q.id}-${key}`);
      let previewText = "";
      if (comp?.editorialTemplate) {
        try {
          previewText = renderRegisteredTemplate(comp.editorialTemplate, {
            "Nome 1": "Alice",
            "Nome 2": "Bruno",
          });
        } catch {
          previewText = comp.editorialTemplate;
        }
      }

      nodes.push({
        id: pairNodeId,
        type: "pairRuleNode",
        position: { x: 800, y: startY + idx * pairYSpacing },
        data: {
          id: rule?.id ?? `PAIR-${q.id}-${key}`,
          questionId: q.id,
          key,
          action,
          moduleIds: rule?.moduleIds ?? [],
          templateId: comp?.id,
          template: comp?.editorialTemplate,
          previewText,
          dependencies: rule?.dependencies ?? [],
        },
      });

      // Conectar das opções participantes até o par
      const [opt1, opt2] = key.split("") as [string, string];
      const optNode1 = `node-opt-${q.id}-${opt1}`;
      const optNode2 = `node-opt-${q.id}-${opt2}`;

      edges.push({
        id: `edge-${optNode1}-${pairNodeId}`,
        source: optNode1,
        target: pairNodeId,
        type: "bezier",
        style: { stroke: "#94a3b8", strokeWidth: 1.5 },
      });

      if (opt1 !== opt2) {
        edges.push({
          id: `edge-${optNode2}-${pairNodeId}`,
          source: optNode2,
          target: pairNodeId,
          type: "bezier",
          style: { stroke: "#94a3b8", strokeWidth: 1.5, strokeDasharray: "4 4" },
        });
      }
    });

    // 4. Nós de Nível 3: Módulos "NÓS DECIDIMOS" (se existirem)
    relatedModules.forEach((mod, modIdx) => {
      const modNodeId = `node-module-${mod.id}`;
      let samplePreview = "";
      if (mod.options?.[0]?.template) {
        try {
          samplePreview = renderRegisteredTemplate(mod.options[0].template, {
            "Nome 1": "Alice",
            "Nome 2": "Bruno",
          });
        } catch {
          samplePreview = mod.options[0].template;
        }
      }

      nodes.push({
        id: modNodeId,
        type: "nosDecidimosNode",
        position: { x: 1220, y: 180 + modIdx * 300 },
        data: {
          id: mod.id,
          questionId: q.id,
          title: mod.title,
          prompt: mod.prompt,
          options: mod.options,
          fieldDefinitions: mod.fieldDefinitions,
          repeatable: mod.repeatable,
          samplePreview,
        },
      });

      // Ligar todos os pares com ação OPEN_NOS_DECIDIMOS a este módulo
      rules
        .filter((r) => r.action === "OPEN_NOS_DECIDIMOS")
        .forEach((r) => {
          const pairNodeId = `node-pair-${q.id}-${r.key}`;
          edges.push({
            id: `edge-${pairNodeId}-${modNodeId}`,
            source: pairNodeId,
            target: modNodeId,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#c86f5d", strokeWidth: 2.5 },
          });
        });
    });

    return {
      question: q,
      nodes,
      edges,
      isDraft,
      relatedModules,
    };
  }

  /**
   * Salva alterações em uma questão específica no rascunho de trabalho.
   */
  async updateQuestion(
    questionId: string,
    updates: {
      title?: string;
      prompt?: string;
      period?: string;
      options?: { code: "A" | "B" | "C"; text: string; privacy: "COMMON" | "PRIVATE" | "SAFETY_PRIVATE" }[];
    },
  ) {
    const { catalog } = await this.getWorkingCatalog();
    const index = catalog.questions.findIndex((q) => q.id === questionId);
    if (index === -1) throw new Error(`Questão "${questionId}" não encontrada.`);

    const current = catalog.questions[index];
    if (updates.title !== undefined) current.title = updates.title.trim();
    if (updates.prompt !== undefined) current.prompt = updates.prompt.trim();
    if (updates.period !== undefined) current.period = updates.period.trim();

    if (updates.options) {
      current.options = updates.options.map((opt) => {
        const existing = current.options.find((o) => o.code === opt.code);
        return {
          code: opt.code,
          text: opt.text.trim(),
          privacy: opt.privacy,
          componentId: existing?.componentId ?? `OUT-${questionId}-${opt.code}`,
        };
      });
    }

    await writeFile(DRAFT_PATH, JSON.stringify(catalog, null, 2), "utf-8");
    return { ok: true, version: catalog.version };
  }

  /**
   * Salva alterações na regra de combinação de um par de respostas (ação e template).
   */
  async updatePairRule(
    questionId: string,
    pairKey: string,
    updates: {
      action?: string;
      editorialTemplate?: string;
    },
  ) {
    const { catalog } = await this.getWorkingCatalog();
    const ruleIndex = catalog.rules.findIndex((r) => r.questionId === questionId && r.key === pairKey);
    if (ruleIndex === -1) throw new Error(`Regra para o par "${questionId} / ${pairKey}" não encontrada.`);

    if (updates.action !== undefined) {
      catalog.rules[ruleIndex].action = updates.action;
    }

    if (updates.editorialTemplate !== undefined) {
      const compId = catalog.rules[ruleIndex].componentId ?? `OUT-PAIR-${questionId}-${pairKey}`;
      catalog.rules[ruleIndex].componentId = compId;

      const comp = catalog.components.find((c) => c.id === compId);
      if (comp) {
        comp.editorialTemplate = updates.editorialTemplate.trim();
        comp.template = updates.editorialTemplate.trim();
      } else {
        catalog.components.push({
          id: compId,
          questionId,
          privacy: "COMMON",
          target: "CONTRACT",
          template: updates.editorialTemplate.trim(),
          editorialTemplate: updates.editorialTemplate.trim(),
          editorialFinal: true,
          active: true,
          version: catalog.version,
          source: "WHITEBOARD_ADMIN",
        });
      }
    }

    await writeFile(DRAFT_PATH, JSON.stringify(catalog, null, 2), "utf-8");
    return { ok: true };
  }

  /**
   * Salva alterações em um Módulo de Decisão Conjunta ("NÓS DECIDIMOS").
   */
  async updateNosDecidimosModule(
    moduleId: string,
    updates: {
      title?: string;
      prompt?: string;
      options?: { code: "A" | "B" | "C"; text: string; template: string }[];
    },
  ) {
    const { catalog } = await this.getWorkingCatalog();
    const modIndex = catalog.modules.findIndex((m) => m.id === moduleId);
    if (modIndex === -1) throw new Error(`Módulo "${moduleId}" não encontrado.`);

    const mod = catalog.modules[modIndex];
    if (updates.title !== undefined) mod.title = updates.title.trim();
    if (updates.prompt !== undefined) mod.prompt = updates.prompt.trim();

    if (updates.options) {
      mod.options = updates.options.map((opt) => {
        const existing = mod.options.find((o) => o.code === opt.code);
        return {
          code: opt.code,
          text: opt.text.trim(),
          template: opt.template.trim(),
          fields: existing?.fields ?? [],
        };
      });
    }

    await writeFile(DRAFT_PATH, JSON.stringify(catalog, null, 2), "utf-8");
    return { ok: true };
  }

  /**
   * Valida e publica o rascunho do Whiteboard como novo Arquivo-Mestre oficial.
   */
  async publishDraft(): Promise<{ ok: boolean; version: string; readiness: ReturnType<typeof catalogReadiness> }> {
    if (!existsSync(DRAFT_PATH)) {
      throw new Error("Não há nenhum rascunho de edições pendente para publicação.");
    }

    const raw = await readFile(DRAFT_PATH, "utf-8");
    const catalog = JSON.parse(raw) as Catalog;

    // Executa o motor de validação rigorosa de integridade
    const readiness = catalogReadiness(catalog);
    if (!readiness.productionReady) {
      throw new Error(
        `O catálogo não está pronto para produção: restam ${readiness.missingApplicability} regras ausentes ou ${readiness.pendingModules} módulos pendentes.`,
      );
    }

    // Incrementa versão e recalcula hash
    const parts = catalog.version.split("-");
    const newVersion = `${parts[0]}-admin.${Date.now()}`;
    catalog.version = newVersion;
    catalog.sourceHash = createHash("sha256").update(JSON.stringify(catalog)).digest("hex");

    // Grava como novo arquivo-mestre oficial
    await writeFile(MASTER_PATH, JSON.stringify(catalog, null, 2), "utf-8");

    // Remove o rascunho, já que foi consolidado
    await unlink(DRAFT_PATH).catch(() => {});

    return { ok: true, version: newVersion, readiness };
  }

  /**
   * Descarta o rascunho e restaura o catálogo oficial.
   */
  async resetDraft() {
    if (existsSync(DRAFT_PATH)) {
      await unlink(DRAFT_PATH);
    }
    return { ok: true };
  }
}
