import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-accent-soft text-xl text-brand" aria-hidden="true">◇</span>
      <h2 className="mt-5 font-serif text-2xl text-brand-strong">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
