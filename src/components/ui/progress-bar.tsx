interface ProgressBarProps {
  value: number;
  label?: string;
}

export function ProgressBar({ value, label = "Progresso" }: ProgressBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium text-brand-strong">{label}</span>
        <span className="text-muted">{normalizedValue}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={normalizedValue}>
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${normalizedValue}%` }} />
      </div>
    </div>
  );
}
