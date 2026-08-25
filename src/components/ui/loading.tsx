export function Loading({ label = "Carregando" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-8 text-sm text-muted">
      <span className="size-5 animate-spin rounded-full border-2 border-line border-t-brand" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
