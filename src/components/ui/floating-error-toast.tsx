"use client";

import { useState } from "react";

interface FloatingErrorToastProps {
  errorCode: string;
  message?: string;
}

export function FloatingErrorToast({ errorCode, message }: FloatingErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 left-1/2 z-50 flex w-[92vw] max-w-lg -translate-x-1/2 items-start justify-between gap-3 rounded-2xl border border-red-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 dark:border-red-900/60 dark:bg-stone-900/95"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </span>
        <div className="flex-1 pr-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
              Código de erro: {errorCode}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-stone-700 dark:text-stone-300">
            {message || "Houve uma inconsistência ou falta de dados para gerar o resultado. Você foi direcionado à 1ª questão para revisar o exame."}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        aria-label="Fechar notificação"
        className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </aside>
  );
}
