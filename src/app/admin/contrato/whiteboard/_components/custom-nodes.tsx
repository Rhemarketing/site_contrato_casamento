"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

export interface QuestionNodeData {
  id: string;
  order: number;
  title: string;
  prompt: string;
  period: string;
  applicability?: unknown;
}

export interface OptionNodeData {
  code: string;
  text: string;
  privacy: string;
}

export interface PairRuleNodeData {
  key: string;
  action: string;
  previewText?: string;
}

export interface NosDecidimosOptionData {
  code: string;
  text: string;
  template?: string;
}

export interface NosDecidimosNodeData {
  id: string;
  title: string;
  prompt: string;
  repeatable?: boolean;
  options?: NosDecidimosOptionData[];
  samplePreview?: string;
}

// 1. Nó de Questão (Q001 a Q200)
export const QuestionNode = memo(({ data, selected }: { data: QuestionNodeData; selected?: boolean }) => {
  return (
    <div
      className={`w-80 rounded-2xl border-2 bg-surface p-4 shadow-md transition-all ${
        selected ? "border-brand ring-4 ring-brand/20" : "border-line hover:border-brand/60"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-md bg-brand px-2.5 py-1 text-xs font-bold text-white">
          {data.id}
        </span>
        <span className="text-xs font-medium text-muted">
          Item {data.order} de 200
        </span>
      </div>

      <h3 className="mt-2.5 font-serif text-base font-bold text-brand-strong line-clamp-2">
        {data.title}
      </h3>

      <p className="mt-1.5 text-xs text-muted line-clamp-3">
        {data.prompt}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line/60 pt-2.5 text-[11px] text-muted">
        <span className="rounded bg-brand/5 px-2 py-0.5 font-semibold text-brand">
          {data.period}
        </span>
        <span className="rounded bg-stone-100 px-2 py-0.5 font-medium text-stone-600">
          {data.applicability && typeof data.applicability === "object" && "always" in data.applicability ? "Geral" : "Condicionada"}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!size-3.5 !bg-brand !border-2 !border-white"
      />
    </div>
  );
});
QuestionNode.displayName = "QuestionNode";

// 2. Nó de Opção de Resposta (A, B, C)
export const OptionNode = memo(({ data, selected }: { data: OptionNodeData; selected?: boolean }) => {
  const isA = data.code === "A";
  const isB = data.code === "B";
  const colorBg = isA ? "bg-emerald-50 border-emerald-200" : isB ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-200";
  const colorBadge = isA ? "bg-emerald-700" : isB ? "bg-amber-700" : "bg-rose-700";

  return (
    <div
      className={`relative w-72 rounded-xl border-2 p-3 shadow-sm transition-all ${colorBg} ${
        selected ? "ring-4 ring-brand/30 border-brand" : "hover:border-brand/50"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-3 !bg-stone-500 !border-2 !border-white"
      />

      <div className="flex items-start gap-2.5">
        <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${colorBadge}`}>
          {data.code}
        </span>
        <div className="flex-1">
          <p className="text-xs leading-relaxed text-foreground line-clamp-3">
            {data.text}
          </p>
          <span className="mt-1.5 inline-block text-[10px] font-semibold text-muted uppercase tracking-wider">
            {data.privacy === "COMMON" ? "Público no casal" : "Privado / Segurança"}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!size-3 !bg-stone-500 !border-2 !border-white"
      />
    </div>
  );
});
OptionNode.displayName = "OptionNode";

// 3. Nó de Combinação de Pares do Casal (AA, AB, AC, BB, BC, CC)
export const PairRuleNode = memo(({ data, selected }: { data: PairRuleNodeData; selected?: boolean }) => {
  const isNosDecidimos = data.action === "OPEN_NOS_DECIDIMOS";
  const isMerge = data.action === "MERGE_EXACT_TEXT";

  return (
    <div
      className={`relative w-80 rounded-xl border-2 bg-surface p-3.5 shadow-sm transition-all ${
        isNosDecidimos
          ? "border-amber-400/90 bg-amber-50/40"
          : isMerge
          ? "border-emerald-300 bg-emerald-50/20"
          : "border-line"
      } ${selected ? "ring-4 ring-brand/30 border-brand" : "hover:border-brand/50"}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-3 !bg-stone-500 !border-2 !border-white"
      />

      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-extrabold text-brand-strong">
          Par [{data.key}]
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            isNosDecidimos
              ? "bg-amber-100 text-amber-900 border border-amber-300"
              : isMerge
              ? "bg-emerald-100 text-emerald-900"
              : "bg-stone-100 text-stone-700"
          }`}
        >
          {isNosDecidimos ? "NÓS DECIDIMOS" : data.action}
        </span>
      </div>

      {data.previewText ? (
        <p className="mt-2 text-xs italic text-stone-700 line-clamp-2">
          &ldquo;{data.previewText}&rdquo;
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-muted">
          {isNosDecidimos ? "Dispara módulo conjunto para o casal pactuar." : "Ação de regra cadastrada."}
        </p>
      )}

      {isNosDecidimos ? (
        <Handle
          type="source"
          position={Position.Right}
          className="!size-3.5 !bg-amber-600 !border-2 !border-white"
        />
      ) : null}
    </div>
  );
});
PairRuleNode.displayName = "PairRuleNode";

// 4. Nó Módulo NÓS DECIDIMOS (Decisão Conjunta)
export const NosDecidimosNode = memo(({ data, selected }: { data: NosDecidimosNodeData; selected?: boolean }) => {
  return (
    <div
      className={`relative w-96 rounded-2xl border-2 border-brand bg-surface p-4 shadow-lg transition-all ${
        selected ? "ring-4 ring-brand/30 border-brand-strong" : "hover:shadow-xl"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-3.5 !bg-brand !border-2 !border-white"
      />

      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-brand">
            NÓS DECIDIMOS
          </span>
        </div>
        <span className="font-mono text-xs font-semibold text-muted">
          {data.id}
        </span>
      </div>

      <h4 className="mt-2.5 font-serif text-base font-bold text-brand-strong">
        {data.title}
      </h4>

      <p className="mt-1 text-xs text-muted">
        {data.prompt}
      </p>

      {/* Opções de Acordo Conjunto */}
      <div className="mt-3 space-y-1.5 rounded-xl bg-stone-50 p-2.5 border border-line/60">
        <p className="text-[11px] font-bold text-brand-strong uppercase">
          Opções Bilaterais de Acordo:
        </p>
        {data.options?.map((opt: NosDecidimosOptionData) => (
          <div key={opt.code} className="text-xs">
            <span className="font-bold text-brand">{opt.code}.</span> {opt.text}
          </div>
        ))}
      </div>

      {/* Prévia da Cláusula Contratual */}
      {data.samplePreview ? (
        <div className="mt-3 rounded-lg bg-emerald-50/60 p-2 border border-emerald-200/80 text-[11px] text-emerald-950">
          <strong className="block text-[10px] uppercase font-bold text-emerald-800">
            Prévia da Cláusula no Contrato:
          </strong>
          <p className="mt-0.5 line-clamp-2 italic">
            &ldquo;{data.samplePreview}&rdquo;
          </p>
        </div>
      ) : null}

      {data.repeatable ? (
        <div className="mt-2 text-[11px] font-medium text-brand">
          * Módulo repetível para múltiplos filhos ou situações.
        </div>
      ) : null}
    </div>
  );
});
NosDecidimosNode.displayName = "NosDecidimosNode";
